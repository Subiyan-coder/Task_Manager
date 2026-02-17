import { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Card, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Initialize user
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // --- 1. DEFINED FIRST TO FIX "REFERENCE ERROR" ---
  async function fetchTasks() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  // --- 2. useEffect CALLS IT SAFELY ---
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [navigate, refreshTrigger]);

  // --- 3. HANDLERS ---
  const handleStatusUpdate = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setRefreshTrigger(prev => prev + 1); 
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
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
      const response = await fetch(`http://localhost:5000/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        setRefreshTrigger(prev => prev + 1); 
        setShowDeleteModal(false); 
        setTaskToDelete(null);
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error deleting task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Task Manager</Navbar.Brand>
          <Nav className="ms-auto">
            <Navbar.Text className="me-3 text-white">
              {user.name} ({user.role})
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Dashboard</h2>
          <Button variant="success" onClick={() => navigate('/create-task')}>
            + Create New Task
          </Button>
        </div>

        <Row>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Col md={6} lg={4} className="mb-4" key={task._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3">
                    {/* STATUS BADGE */}
                    <Badge bg={task.status === 'Completed' ? 'success' : 'warning'}>
                        {task.status || 'Pending'}
                    </Badge>
                    
                    {/* EDIT & DELETE BUTTONS (Only 1 set!) */}
                    {(user.role === 'Superior' || task.createdBy === user._id) && (
                        <div className="d-flex gap-2">
                           {/* EDIT BUTTON (Pencil Icon) */}
                           <Button variant="outline-primary" size="sm" onClick={() => navigate(`/edit-task/${task._id}`)} style={{ border: 'none' }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                               <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                             </svg>
                           </Button>
                           
                           {/* DELETE BUTTON (Trashcan Icon) */}
                           <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(task._id)} style={{ border: 'none' }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                               <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                             </svg>
                           </Button>
                        </div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{task.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      {task.description}
                    </Card.Text>
                    <hr />
                    <div className="small text-muted mb-3">
                      <strong>Assigned to:</strong>{' '}
                      {task.assignedTo && task.assignedTo.length > 0 
                        ? task.assignedTo.map(u => u.name).join(', ') 
                        : 'Unassigned'}
                    </div>

                    <Button 
                        variant={task.status === 'Completed' ? "outline-secondary" : "outline-success"} 
                        size="sm" 
                        className="w-100"
                        onClick={() => handleStatusUpdate(task._id, task.status)}
                    >
                        {task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card className="text-center p-5 bg-light border-0">
                <h4 className="text-muted">No tasks found</h4>
                <p>Click "Create New Task" to get started.</p>
              </Card>
            </Col>
          )}
        </Row>
      </Container>

      {/* --- DELETE MODAL --- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;