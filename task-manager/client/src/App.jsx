import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Button } from 'react-bootstrap'; // Import Button

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';

const App = () => {
  // 1. Initialize State from LocalStorage (Memory)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // 2. Apply the class to the <body> tag whenever state changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      
      {/* 3. Global Toggle Button (Floating in bottom-right corner) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <Button 
          variant={darkMode ? "light" : "dark"} 
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-circle shadow-lg p-3"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </Button>
      </div>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/edit-task/:id" element={<EditTask />} />
      </Routes>
    </Router>
  );
};

export default App;