import { useEffect, useState } from 'react';
import { Container, Table, Button, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BASE_URL from '../api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Security: Kick them out if they aren't an Admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      toast.error("Unauthorized Access");
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
        console.error("Fetch users error:", error);
      toast.error("Failed to load users");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("User deleted successfully");
        // Remove the deleted user from the screen immediately
        setUsers(users.filter(u => u._id !== id));
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users (Admin)</h2>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className="align-middle fw-medium">{user.name}</td>
                <td className="align-middle text-muted">{user.email}</td>
                <td className="align-middle">
                  <Badge 
                    bg={user.role === 'Admin' ? 'danger' : user.role === 'Superior' ? 'primary' : 'success'}
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="align-middle">
                  {/* Hide delete button for the currently logged-in Admin */}
                  {user._id !== currentUser._id && (
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user._id)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ManageUsers;