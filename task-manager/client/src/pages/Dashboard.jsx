import { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  
  // Initialize user from localStorage
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetchTasks();
    }
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title>{task.title}</Card.Title>
                      <Badge bg={task.status === 'Completed' ? 'success' : 'warning'}>
                        {task.status || 'Pending'}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      {task.description}
                    </Card.Text>
                    <hr />
                    <div className="small text-muted">
                      <strong>Assigned to:</strong>{' '}
                      {task.assignedTo && task.assignedTo.length > 0 
                        ? task.assignedTo.map(u => u.name).join(', ') 
                        : 'Unassigned'}
                    </div>
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
    </>
  );
};

export default Dashboard;