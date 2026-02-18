import toast from 'react-hot-toast';
import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom'; 
import BASE_URL from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      // 1. Send the data to the backend
      const response = await fetch('${BASE_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. SUCCESS: Save the token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        toast.success("Welcome back! Login Successful.");
        
        // 3. Redirect (We'll build the dashboard next)
        navigate('/dashboard'); 
      } else {
        // 4. FAIL: Show the error message from backend
        toast.error(data.message || "Invalid Email or Password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="shadow-lg p-4" style={{ width: '25rem' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Welcome Back</h2>
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-lg shadow">
              Login
            </Button>
          </Form>
          
          <div className="mt-4 text-center">
             <span className="text-muted">Don't have an account? </span>
             <Link to="/register" className="text-info fw-bold text-decoration-none">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;