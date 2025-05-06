import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate(); // Initialize the navigate hook

    useEffect(() => {
        document.title = "Log In - Occams Portal"; // Set title for Login page

        // Check if user is already logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            // User is already logged in, redirect to dashboard
            navigate('/dashboard');
        }
    }, [navigate]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // State to manage loading

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission
        setIsLoading(true); // Set loading state to true
        const apiUrl = "https://play.occamsadvisory.com/portal/wp-json/oc/v1/login"; // New API endpoint

        // POST request with username and password
        axios
            .post(apiUrl, {
                username,
                password,
            })
            .then((response) => {
                setResponseMessage("Login successful!"); // Handle successful login
                localStorage.setItem("user", JSON.stringify(response.data));
                console.log(response.data); // Log the response data

                // Redirect to dashboard after successful login
                setTimeout(() => {
                    navigate('/dashboard'); // Redirect to dashboard page
                }, 1000); // Short delay to show the success message
            })
            .catch((error) => {
                setError(error.response ? error.response.data.message : error.message); // Handle errors
                // Don't navigate on error
            })
            .finally(() => {
                setIsLoading(false); // Reset loading state
            });
    };

    // Automatic redirection on component mount if user is already logged in
    // This ensures users who are already logged in are redirected to the dashboard
    // After successful login, user will be redirected to the dashboard page
    // Users cannot access the login page if they are already logged in


    return (
        <div className="vh-100 login-page">
            <div className="container h-100">
              <div className='row'>
              <img src="/assets/images/login-logo-360-white.png" className="mb-5 mt-4 login-logo" />
              </div>
                <div className="row align-items-center justify-content-between mt-5">
                    {/* Left Section */}
                    <div className="col-12 col-lg-6 text-center text-lg-start text-white login-left">
                        <h1>Unlock Seamless</h1>
                        <h2>Connectivity with</h2>
                        <h3>Connect 360</h3>
                        <p>Effortless Access and Streamlined Collaboration</p>
                    </div>

                    {/* Right Section */}
                    <div className="col-12 col-lg-5 mx-auto">
                        <div className="bg-white login-form">
                            <h2 className="text-center fw-bold login-head">Sign in</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <input
                                    type="text"
                                    className="form-control" placeholder='Username'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading} // Disable input when loading
                                />
                                </div>
                                <div className="mb-4">
                                    <input
                                    type="password"
                                    className="form-control" placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading} // Disable input when loading
                                />
                                </div>

                                <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? 'Please wait...' : 'Login'}
                            </button>
                            </form>
                            {responseMessage && <p className="response-msg">{responseMessage}</p>}
                        {error && <p className="error-msg">Error: {error}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="position-absolute bottom-0 start-0 p-3 text-white w-100 text-center">
                <small>Copyright © 2025 Occams Portal. All rights reserved.</small>
            </div>
        </div>
    );
};

export default Login;
