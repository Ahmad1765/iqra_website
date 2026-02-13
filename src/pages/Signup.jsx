import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';
import { motion } from 'framer-motion';
import logo from '../assets/new_logo.png';

const Signup = () => {
    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        country: '',
        state: '',
        address: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    // Easier approach: just use standard controlled inputs
    const handleFirstNameChange = (e) => setFormData({ ...formData, first_name: e.target.value });
    const handleLastNameChange = (e) => setFormData({ ...formData, last_name: e.target.value });
    const handleCountryChange = (e) => setFormData({ ...formData, country: e.target.value });
    const handleStateChange = (e) => setFormData({ ...formData, state: e.target.value });
    const handleAddressChange = (e) => setFormData({ ...formData, address: e.target.value });
    const handleEmailChange = (e) => setFormData({ ...formData, email: e.target.value });
    const handlePasswordChange = (e) => setFormData({ ...formData, password: e.target.value });
    const handleConfirmChange = (e) => setFormData({ ...formData, password_confirmation: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/register', formData);
            // Assuming register returns a token, or we redirect to login
            // For now, let's redirect to login
            setLoading(false);
            navigate('/login');
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.data && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please check your connection.');
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-page"
        >
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-image-side signup-image">
                        <div className="auth-overlay">
                            <h2>Join Us Today!</h2>
                            <p>Start your journey towards financial freedom with our advanced trading tools.</p>
                        </div>
                    </div>
                    <div className="auth-form-side">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <img src={logo} alt="Logo" style={{ height: '60px' }} />
                            </Link>
                            <h1>Create Account</h1>
                            <p>Sign up to start your trading experience</p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" placeholder="John" value={formData.first_name} onChange={handleFirstNameChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" placeholder="Doe" value={formData.last_name} onChange={handleLastNameChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" placeholder="United States" value={formData.country} onChange={handleCountryChange} required />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input type="text" placeholder="New York" value={formData.state} onChange={handleStateChange} required />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input type="text" placeholder="123 Wall Street" value={formData.address} onChange={handleAddressChange} required />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="name@company.com" value={formData.email} onChange={handleEmailChange} required />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" placeholder="Min. 8 characters" value={formData.password} onChange={handlePasswordChange} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" placeholder="••••••••" value={formData.password_confirmation} onChange={handleConfirmChange} required />
                            </div>

                            <div className="form-options">
                                <label className="checkbox-container">
                                    <input type="checkbox" required />
                                    <span className="checkmark"></span>
                                    I agree to the <Link to="/compliance">Terms & Privacy Policy</Link>
                                </label>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login">Sign In</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Signup;
