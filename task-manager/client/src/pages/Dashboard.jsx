import { useEffect, useState, useMemo } from 'react';
import { Container, Navbar, Nav, Button, Card, Row, Col, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BASE_URL from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // For filtering
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All'); // For Superior to filter by member
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // User State
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // --- 1. FETCH DATA ---
  async function fetchTasks() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
      
      // If Superior OR Admin, fetch users for the filter dropdown

      if (user?.role === 'Superior' || user?.role === 'Admin') {
        const userRes = await fetch(`${BASE_URL}/api/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if(userRes.ok) setAllUsers(await userRes.json());
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [navigate, refreshTrigger]);

  // --- 2. CALCULATE STATS ---
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
    };
  }, [tasks]);
 
  // --- EXTRACT SUPERIORS FOR MEMBER FILTER ---
  const uniqueSuperiors = useMemo(() => {
    if (user?.role === 'Superior' || user?.role === 'Admin') return [];
    
    const superiorsMap = new Map();
    tasks.forEach(t => {
      if (t.createdBy && t.createdBy.role === 'Superior') {
        // Store unique ID and Name
        superiorsMap.set(t.createdBy._id, t.createdBy.name);
      }
    });
    // Convert Map back to array for the dropdown
    return Array.from(superiorsMap, ([_id, name]) => ({ _id, name }));
  }, [tasks, user]);

  // --- 3. FILTER & SORT LOGIC ---
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // A. Search
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // B. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    } 
    // Default Rule: If I am a Member and NO filter is touched, show "In Progress" on the right? 
    // (We will handle visual default in the JSX instead of filtering data out)

    // C. User Filter (Smart Role Logic)
    if (userFilter !== 'All') {
      if (user.role === 'Superior' || user.role === 'Admin') {
        // Superiors filter by who is ASSIGNED the task
        result = result.filter(t => t.assignedTo.some(u => u._id === userFilter));
      } else {
        // Members filter by who CREATED the task (The Superior)
        result = result.filter(t => t.createdBy && t.createdBy._id === userFilter);
      }
    }

    // D. Sort
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [tasks, searchTerm, statusFilter, userFilter, sortOrder, user.role]);


  // --- HANDLERS ---
  const updateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setRefreshTrigger(prev => prev + 1);
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Update failed");
    }
  };

  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Task deleted");
        setRefreshTrigger(prev => prev + 1);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'success';
    if (status === 'In Progress') return 'primary';
    return 'warning';
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* --- NAVBAR --- */}
      <Navbar expand="lg" className="shadow-sm border-bottom">
        <Container fluid>
          <Navbar.Brand className="fw-bold text-info">TaskMaster</Navbar.Brand>
          <Nav className="ms-auto d-flex flex-row align-items-center gap-3">
             {/* User Profile Info */}
            <div className="text-end d-none d-md-block">
                <div className="fw-bold">{user.name}</div>
                <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{user.role}</div>
            </div>
            {/* ONLY ADMIN SEES THIS BUTTON */}
            {user.role === 'Admin' && (
               <Button variant="warning" size="sm" onClick={() => navigate('/manage-users')}>Manage Users</Button>
            )}
            
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        
        {/* --- TOP SECTION: STATS --- */}
        <Row className="mb-4 g-3">
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100 border-start border-4 border-primary">
                    <Card.Body>
                        <h6 className="text-muted text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Total Tasks</h6>
                        <h2 className="mb-0 fw-bold">{stats.total}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100 border-start border-4 border-warning">
                    <Card.Body>
                        <h6 className="text-muted text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Pending</h6>
                        <h2 className="mb-0 fw-bold text-warning">{stats.pending}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100 border-start border-4 border-info">
                    <Card.Body>
                        <h6 className="text-muted text-uppercase mb-2" style={{fontSize: '0.8rem'}}>In Progress</h6>
                        <h2 className="mb-0 fw-bold text-info">{stats.inProgress}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100 border-start border-4 border-success">
                    <Card.Body>
                        <h6 className="text-muted text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Completed</h6>
                        <h2 className="mb-0 fw-bold text-success">{stats.completed}</h2>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* --- BOTTOM SECTION: SPLIT SCREEN --- */}
        <Row>
          {/* --- LEFT: MAIN TASK FEED --- */}
          <Col lg={8} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-secondary">Task Feed</h5>
                <Button variant="primary" onClick={() => navigate('/create-task')} className="shadow-sm">
                    + New Task
                </Button>
            </div>

            {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                    <Card key={task._id} className="border-0 shadow-sm mb-3 task-card hover-shadow">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 className="fw-bold mb-1">{task.title}</h5>
                                    <p className="text-muted small mb-2">{task.description}</p>
                                    
                                    {/* NEW: Assignment Details (From -> To) */}
                                    <div className="mt-3 border-top pt-2">
                                        <div className="d-flex flex-column gap-1 small text-muted">
                                            <span>
                                                <strong>From: </strong> 
                                                {task.createdBy ? task.createdBy.name : 'Unknown'}
                                            </span>
                                            <span>
                                                <strong>To: </strong> 
                                                {task.assignedTo && task.assignedTo.length > 0 
                                                    ? task.assignedTo.map(u => u.name).join(', ') 
                                                    : 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="d-flex gap-2 align-items-center mt-2">
                                        <Badge bg="light" text="dark" className="border">
                                            Created: {new Date(task.createdAt).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="d-flex flex-column gap-2">
                                    {/* Action Buttons (Edit/Delete) */}
                                    {(user.role === 'Admin' || user.role === 'Superior' || (task.createdBy && (task.createdBy._id === user._id || task.createdBy._id === user.id))) && (
                                        <div className="d-flex gap-1 justify-content-end">
                                            <Button variant="light" size="sm" onClick={() => navigate(`/edit-task/${task._id}`)}>✏️</Button>
                                            <Button variant="light" size="sm" className="text-danger" onClick={() => confirmDelete(task._id)}>🗑️</Button>
                                        </div>
                                    )}
                                    
                                    {/* Status Dropdown */}
                                    <Form.Select 
                                        size="sm" 
                                        value={task.status} 
                                        onChange={(e) => updateStatus(task._id, e.target.value)}
                                        style={{width: '130px'}}
                                        className={`border-${getStatusColor(task.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </Form.Select>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <div className="text-center py-5 text-muted">No tasks found matching your filters.</div>
            )}
          </Col>


          {/* --- RIGHT: FILTERS & CONTROL --- */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4 sticky-top" style={{top: '20px', zIndex: 100}}>
                <Card.Header className="border-bottom-0 pt-4 pb-0">
                    <h6 className="fw-bold text-info">Sort & Filter</h6>
                </Card.Header>
                <Card.Body>
                    {/* Search */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Search</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Find a task..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>

                    {/* Status Filter */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Status</Form.Label>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">Started / In Progress</option>
                            <option value="Completed">Completed</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Dynamic Team/Superior Filter */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">
                            {user.role === 'Superior' || user.role === 'Admin' ? 'Filter by Member' : 'Filter by Superior'}
                        </Form.Label>
                        <Form.Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                            <option value="All">
                                All {user.role === 'Superior' || user.role === 'Admin' ? 'Members' : 'Superiors'}
                            </option>
                            
                            {user.role === 'Superior' || user.role === 'Admin' 
                                ? allUsers.map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))
                                : uniqueSuperiors.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>

                    {/* Sort Order */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Sort By</Form.Label>
                        <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="newest">Recently Added</option>
                            <option value="oldest">Oldest First</option>
                        </Form.Select>
                    </Form.Group>

                    <hr />
                    <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All');
                        setUserFilter('All');
                        setSortOrder('newest');
                    }}>
                        Reset Filters
                    </Button>
                </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Task</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;