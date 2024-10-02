import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext'; 
import Swal from 'sweetalert2';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUserRole } = useUser(); // Get the setUserRole function from context

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('https://localhost:7104/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            if (!response.ok) throw new Error('Invalid username or password.');

            const data = await response.json();
    
            // Store JWT in localStorage
            localStorage.setItem('token', data.token);
    
            // Decode the token to get user information
            const decoded = jwtDecode(data.token);
            console.log('Decoded token:', decoded);
    
            localStorage.setItem('userId', decoded.nameid); 
            localStorage.setItem('role', decoded.role); 
            setUserRole(decoded.role);

           // Show SweetAlert2 and automatically navigate after 2 seconds
            Swal.fire({
                title: 'Login Successful',
                text: 'Welcome!',
                icon: 'success',
                timer: 2000, // Automatically close after 2 seconds
                showConfirmButton: false // Hide the "Proceed" button
            }).then(() => {
                // Navigate based on role after 2 seconds
                if (decoded.role === 'ADMIN') {
                    navigate('/admin/admindashboard');
                } else {
                    navigate('/');
                }
            });

        } catch (err) {
            Swal.fire({
                title: 'Login Failed',
                text: err.message || 'Failed to log in.',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        }
    };        

    return (
        <div className="container d-flex justify-content-center align-items-center vh-50">
            <div className="card p-4" style={{ width: '400px' }}>
                <h2 className="text-center">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-3">
                        <label>Username:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
