import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]); // List of IDs
  const [allUsers, setAllUsers] = useState([]); // List of users from DB
  const [error, setError] = useState(null);
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // If user is a Superior, fetch the list of team members
    if (currentUser && currentUser.role === 'Superior') {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleUserSelect = (userId) => {
    // Toggle logic: If in list, remove it. If not, add it.
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter((id) => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // If Superior, send the list. If Team Member, backend handles it.
        body: JSON.stringify({ 
          title, 
          description, 
          assignedTo: currentUser.role === 'Superior' ? assignedUsers : [] 
        }),
      });

      if (response.ok) {
        toast.success("Task Created Successfully!");
        navigate('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError('Something went wrong.');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Create New Task</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={submitHandler}>
        <Row>
          {/* LEFT COLUMN: Task Details */}
          <Col md={currentUser?.role === 'Superior' ? 8 : 12}>
            <Card className="p-4 shadow-sm">
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Deliver food to North Taluk"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter detailed instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="success" type="submit" size="lg">
                Create Task
              </Button>
              <Button variant="secondary" className="ms-3" size="lg" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </Card>
          </Col>

          {/* RIGHT COLUMN: User List (Superior Only) */}
          {currentUser?.role === 'Superior' && (
            <Col md={4}>
              <Card className="p-3 shadow-sm bg-light h-100">
                <h5 className="mb-3">Assign To:</h5>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {allUsers.length > 0 ? (
                    allUsers.map((user) => (
                      <Form.Check 
                        key={user._id}
                        type="checkbox"
                        id={`user-${user._id}`}
                        label={`${user.name} (${user.role})`}
                        className="mb-2"
                        checked={assignedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                      />
                    ))
                  ) : (
                    <p className="text-muted">Loading users...</p>
                  )}
                </div>
                <Form.Text className="text-muted mt-2">
                  Select multiple users to create a shared task.
                </Form.Text>
              </Card>
            </Col>
          )}
        </Row>
      </Form>
    </Container>
  );
};

export default CreateTask;