import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import './Nav.css';
import logo from '../assets/navbar_logo.png';

function Nav() {
    const { isAuthenticated, logout } = useAuth();
    return (
        <>
            {/* Announcement Bar */}
            <div className="announcement-bar">
                <span className="announcement-icon">⚙️</span>
                <span className="announcement-text">
                    <strong>Limited Time Offer:</strong> 0% Commission on All Trades! Sign up today.
                </span>
            </div>

            {/* Main Navbar */}
            <nav className="main-navbar">
                <div className="navbar-container">

                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">
                            <img src={logo} alt="BuckHolding Logo" style={{ height: '40px', width: 'auto' }} />
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <ul className="nav-menu">
                        <li><Link to="/" className="nav-link">Home</Link></li>
                        <li><Link to="/about" className="nav-link">About</Link></li>
                        <li><Link to="/compliance" className="nav-link">Compliance</Link></li>
                        <li><Link to="/contact" className="nav-link">Contact Us</Link></li>
                        <li><Link to="/support" className="nav-link">Support</Link></li>
                    </ul>

                    {/* Auth Buttons */}
                    <div className="auth-buttons">
                        {isAuthenticated ? (
                            <div className="auth-logged-in">
                                <Link to="/dashboard" className="dashboard-btn" style={{
                                    background: '#4A9FD4',
                                    color: '#ffffff',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}>
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="logout-nav-btn" style={{
                                    background: 'transparent',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginLeft: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="login-btn">Login</Link>
                                <Link to="/signup" className="signup-btn">
                                    Sign Up <span className="arrow">→</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Nav;
