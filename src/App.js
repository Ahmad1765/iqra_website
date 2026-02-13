import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import Compliance from './pages/Compliance';
import Support from './pages/Support';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import KycSubmission from './pages/KycSubmission';
import PaymentForm from './pages/PaymentForm';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import DepositHistory from './pages/DepositHistory';
import AllStocks from './pages/AllStocks';
import ManageAssets from './pages/ManageAssets';
import TransferBalance from './pages/TransferBalance';
import ManageDeposit from './pages/ManageDeposit';
import ManageWithdraw from './pages/ManageWithdraw';
import TransactionHistory from './pages/TransactionHistory';
import ManageReferrals from './pages/ManageReferrals';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';

import { AuthProvider } from './context/AuthContext';

// Layout Component to handle Nav and Footer logic
const MainLayout = () => {
    return (
        <>
            <NavWrapper />
            <Outlet />
            <FooterWrapper />
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router basename={window.location.pathname.startsWith('/iqra_website') ? '/iqra_website' : '/'}>
                <div className="App">
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Home />} />
                            <Route path="about" element={<About />} />
                            <Route path="compliance" element={<Compliance />} />
                            <Route path="contact" element={<Contact />} />

                            <Route path="login" element={<Login />} />
                            <Route path="signup" element={<Signup />} />
                            <Route path="forgot-password" element={<ForgotPassword />} />
                            <Route path="reset-password" element={<ResetPassword />} />

                            {/* Protected User Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="kyc" element={<KycSubmission />} />
                                <Route path="fund" element={<PaymentForm />} />
                                <Route path="deposit-history" element={<DepositHistory />} />
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="stocks" element={<AllStocks />} />
                                <Route path="assets" element={<ManageAssets />} />
                                <Route path="transfer" element={<TransferBalance />} />

                                <Route path="deposit" element={<Navigate to="/deposit/new" replace />} />
                                <Route path="deposit/new" element={<ManageDeposit defaultTab="new" />} />
                                <Route path="deposit/history" element={<ManageDeposit defaultTab="history" />} />

                                <Route path="withdraw" element={<Navigate to="/withdraw/new" replace />} />
                                <Route path="withdraw/new" element={<ManageWithdraw defaultTab="new" />} />
                                <Route path="withdraw/history" element={<ManageWithdraw defaultTab="history" />} />

                                <Route path="transactions" element={<TransactionHistory />} />

                                <Route path="support" element={<Navigate to="/support/history" replace />} />
                                <Route path="support/new" element={<Support defaultTab="new" />} />
                                <Route path="support/history" element={<Support defaultTab="history" />} />

                                <Route path="referrals" element={<ManageReferrals />} />
                                <Route path="profile" element={<Profile />} />
                            </Route>
                        </Route>

                        {/* Admin Route - Outside MainLayout because it might have its own or no layout */}
                        <Route path="/admin" element={<AdminRoute />} />

                        {/* Catch-all to redirect to home or show 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

// Protected Admin Route Component
const AdminRoute = () => {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;

    // 1. If Admin, show Panel
    if (isAdmin) return <AdminPanel />;

    // 2. If Regular User (Logged in but not Admin), DO NOT show Admin Login. Redirect to User Dashboard.
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    // 3. If Guest (Not logged in), show Admin Login Portal
    return <AdminLogin />;
};

// Protected User Route Component
const ProtectedRoute = () => {
    return <OutletWithAuth />;
};

const OutletWithAuth = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="loading-spinner">Loading...</div>; // Or null
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Simple wrappers to hide on admin route
const NavWrapper = () => {
    const location = useLocation();
    const hiddenRoutes = [
        '/admin',
        '/dashboard',
        '/stocks',
        '/assets',
        '/transfer',
        '/deposit',
        '/withdraw',
        '/transactions',
        '/support',
        '/referrals',
        '/fund',
        '/profile',
        '/kyc',
        '/deposit-history'
    ];

    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
    return shouldHide ? null : <Nav />;
};

const FooterWrapper = () => {
    const location = useLocation();
    const hiddenRoutes = [
        '/admin',
        '/dashboard',
        '/stocks',
        '/assets',
        '/transfer',
        '/deposit',
        '/withdraw',
        '/transactions',
        '/support',
        '/referrals',
        '/fund',
        '/profile'
    ];

    // Check if current path starts with any of the hidden routes
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

    return shouldHide ? null : <Footer />;
};

export default App;
