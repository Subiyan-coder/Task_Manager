import toast from 'react-hot-toast';
import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom'; 
import BASE_URL from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 1. Turn loading ON
    try {
      // 1. Send the data to the backend
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
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
    } finally {
      setIsLoading(false); // 2. Turn loading OFF (whether it succeeded or failed)
    }
  };

const fillCredentials = (demoEmail, demoPassword) => {
  setEmail(demoEmail);
  setPassword(demoPassword);
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

           <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary w-100 fw-bold mt-3"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Connecting to Server (May take 50s)...
                    </>
                  ) : (
                    'Login'
                  )}
             </button>
          </Form>

          {/* --- DEMO INFO SECTION --- */}

          <div className="mt-4 border-top pt-3">
            <button 
              type="button" 
              onClick={() => setShowDemo(!showDemo)} 
              className="btn btn-link w-100 text-decoration-none text-primary fw-medium"
            >
              ℹ️ {showDemo ? 'Hide Project Info' : 'Click here for Project Info & Demo Accounts'}
            </button>

            {showDemo && (
              <div className="mt-3 p-3 bg-light rounded border shadow-sm text-dark">
                <p className="mb-3" style={{ fontSize: '0.9rem' }}>
                  <strong>About:</strong> This is a role-based Task Manager. The backend is hosted on Render's free tier, so the <strong>first login might take up to 50 seconds</strong> to wake the server.
                </p>
                
                <div className="text-start">
                  
                  {/* --- SUPERIOR ACCOUNTS --- */}
                  <div className="text-secondary fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
                    Superiors (Can Create/Assign)
                  </div>
                  
                  {/* Superior 1 */}
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 bg-white border rounded shadow-sm">
                    <div>
                      <span className="fw-bold text-primary">Superior 1:</span>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.85rem' }}>superior1@test.com / password123</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fillCredentials('superior1@test.com', 'password123')} 
                      className="btn btn-sm btn-outline-primary fw-semibold"
                    >
                      Auto-Fill
                    </button>
                  </div>

                  {/* Superior 2 */}
                  <div className="d-flex justify-content-between align-items-center p-2 mb-3 bg-white border rounded shadow-sm">
                    <div>
                      <span className="fw-bold text-primary">Superior 2:</span>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.85rem' }}>superior2@test.com / password123</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fillCredentials('superior2@test.com', 'password123')} 
                      className="btn btn-sm btn-outline-primary fw-semibold"
                    >
                      Auto-Fill
                    </button>
                  </div>

                  {/* --- MEMBER ACCOUNTS --- */}
                  <div className="text-secondary fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
                    Members (Can Update Status)
                  </div>

                  {/* Member 1 */}
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 bg-white border rounded shadow-sm">
                    <div>
                      <span className="fw-bold text-success">Member 1:</span>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.85rem' }}>member1@test.com / password123</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fillCredentials('member1@test.com', 'password123')} 
                      className="btn btn-sm btn-outline-success fw-semibold"
                    >
                      Auto-Fill
                    </button>
                  </div>

                  {/* Member 2 */}
                  <div className="d-flex justify-content-between align-items-center p-2 mb-2 bg-white border rounded shadow-sm">
                    <div>
                      <span className="fw-bold text-success">Member 2:</span>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.85rem' }}>member2@test.com / password123</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fillCredentials('member2@test.com', 'password123')} 
                      className="btn btn-sm btn-outline-success fw-semibold"
                    >
                      Auto-Fill
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
          
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