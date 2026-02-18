import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast'; // The Pop-up library
import BASE_URL from '../api';

const EditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the Task ID from the URL

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]); // Selected IDs
  const [allUsers, setAllUsers] = useState([]); // All available users
  
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 1. Fetch Task Details AND All Users when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch All Users (for the checklist)
        if (currentUser.role === 'Superior') {
          const userRes = await fetch(`${BASE_URL}/api/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await userRes.json();
          setAllUsers(userData);
        }

        // Fetch The Task Details
        const taskRes = await fetch(`${BASE_URL}/api/tasks`, { // We fetch all and filter because we didn't make a single task route
            headers: { Authorization: `Bearer ${token}` },
        });
        const taskData = await taskRes.json();
        
        // Find the specific task we want to edit
        const myTask = taskData.find(t => t._id === id);
        
        if (myTask) {
            setTitle(myTask.title);
            setDescription(myTask.description);
            // Pre-fill the assigned users list
            const currentAssignees = myTask.assignedTo.map(u => u._id);
            setAssignedUsers(currentAssignees);
        }

      } catch (err) {
        console.error("Error loading task data:", err);
        toast.error("Failed to load task data");
      }
    };
    fetchData();
  }, [id, currentUser.role]);

  const handleUserSelect = (userId) => {
    // Toggle logic: If in list, remove (unselect). If not, add.
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter((id) => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          description, 
          assignedTo: currentUser.role === 'Superior' ? assignedUsers : undefined 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Task Updated Successfully!");
        navigate('/dashboard');
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
        console.error("Error updating task:", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Edit Task</h2>
      
      <Form onSubmit={updateHandler}>
        <Row>
          <Col md={currentUser?.role === 'Superior' ? 8 : 12}>
            <Card className="p-4 shadow-sm">
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  type="text"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" size="lg">
                Save Changes
              </Button>
              <Button variant="secondary" className="ms-3" size="lg" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </Card>
          </Col>

          {currentUser?.role === 'Superior' && (
            <Col md={4}>
              <Card className="p-3 shadow-sm bg-light h-100">
                <h5 className="mb-3">Modify Assignments:</h5>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {allUsers.map((user) => (
                    <Form.Check 
                      key={user._id}
                      type="checkbox"
                      id={`user-${user._id}`}
                      label={`${user.name}`}
                      className="mb-2"
                      // Check the box if their ID is in the assignedUsers list
                      checked={assignedUsers.includes(user._id)}
                      onChange={() => handleUserSelect(user._id)}
                    />
                  ))}
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </Form>
    </Container>
  );
};

export default EditTask;