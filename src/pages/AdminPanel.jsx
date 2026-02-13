import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminPanel.css';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { SiVisa, SiMastercard, SiDiscover, SiAmericanexpress } from 'react-icons/si';
import { FaUniversity, FaBitcoin, FaCreditCard, FaWallet, FaMoneyBillWave, FaExchangeAlt, FaChartLine, FaChevronRight } from 'react-icons/fa';

const stripePublishableKey =
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_TYooMQauvdEDq54NiTphI7jx'; // fallback for local/dev

const stripePromise = loadStripe(stripePublishableKey).catch(err => {
    console.warn("Stripe.js failed to load. Card payments will be disabled.", err);
    return null;
});

// No mock data here anymore

const AdminPanel = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [kycs, setKycs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [viewTicket, setViewTicket] = useState(null); // Admin viewing specific ticket
    const [adminReplyMsg, setAdminReplyMsg] = useState('');
    const [adminReplyFiles, setAdminReplyFiles] = useState([]);
    const [newTicketFiles, setNewTicketFiles] = useState([]);
    const adminReplyFileRef = useRef(null);
    const newTicketFileRef = useRef(null);

    const fetchAdminTicketDetails = async (id) => {
        try {
            const res = await api.get(`/admin/support/tickets/${id}`);
            setViewTicket(res.data);
            // Switch tab or ensure we are on support view
        } catch (err) {
            showToast('Failed to load ticket details', 'error');
        }
    };

    const handleAdminFileChange = (e) => {
        if (e.target.files) {
            setAdminReplyFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeAdminFile = (index) => {
        setAdminReplyFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleNewTicketFileChange = (e) => {
        if (e.target.files) {
            setNewTicketFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewTicketFile = (index) => {
        setNewTicketFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleAdminReply = async () => {
        if (!adminReplyMsg.trim() && adminReplyFiles.length === 0) return;
        try {
            const formData = new FormData();
            formData.append('message', adminReplyMsg);
            adminReplyFiles.forEach(file => {
                formData.append('attachments[]', file);
            });

            const res = await api.post(`/admin/support/tickets/${viewTicket.id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local view
            setViewTicket(prev => ({
                ...prev,
                status: 'Answered',
                messages: [...prev.messages, {
                    ...res.data.ticket_message,
                    user: { name: 'You (Admin)' },
                    created_at: new Date().toISOString()
                }]
            }));
            setAdminReplyMsg('');
            setAdminReplyFiles([]);
            showToast('Reply sent', 'success');
        } catch (err) {
            showToast('Failed to send reply', 'error');
        }
    };

    const handleAdminCloseTicket = async () => {
        if (!window.confirm("Close this ticket?")) return;
        try {
            await api.post(`/admin/support/tickets/${viewTicket.id}/close`);
            setViewTicket(prev => ({ ...prev, status: 'Closed' }));
            showToast('Ticket closed', 'success');
            fetchData(true); // refresh list
        } catch (err) {
            showToast('Failed to close ticket', 'error');
        }
    };

    // Transfer specific state
    const [transferData, setTransferData] = useState({
        amount: '',
        from: 'funding',
        to: 'holding'
    });
    const [historyFilters, setHistoryFilters] = useState({
        number: '',
        type: 'all',
        remark: 'any',
        stock: 'all'
    });

    const [supportTab, setSupportTab] = useState('my-tickets'); // 'new-ticket' or 'my-tickets'
    const [supportTickets, setSupportTickets] = useState([]);
    const [supportSubmenuOpen, setSupportSubmenuOpen] = useState(false);
    const [referralTab, setReferralTab] = useState('link'); // 'link' or 'referred-users'
    const [referralSubmenuOpen, setReferralSubmenuOpen] = useState(false);
    const [balances, setBalances] = useState({
        funding: 0.00,
        holding: 0.00
    });
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    // Sub-tab state for Transfer/Deposit section
    const [dashboardTab, setDashboardTab] = useState('account'); // 'account' or 'assets'
    const [financeTab, setFinanceTab] = useState('transfer');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [selectedSavedCard, setSelectedSavedCard] = useState(null);

    // ... KYC Rejection State ...
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 10000); // Polling every 10s for "real-time" (silent)
        return () => clearInterval(interval);
    }, []);

    // Load TradingView Widget (Ticker Tape)
    useEffect(() => {
        const container = document.getElementById('tradingview-widget-container');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
                    { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                    { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "light",
                "isTransparent": false,
                "displayMode": "adaptive",
                "locale": "en"
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Economic Calendar Widget
    useEffect(() => {
        const container = document.getElementById('economic-calendar-widget');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "colorTheme": "light",
                "isTransparent": false,
                "locale": "en",
                "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
                "importanceFilter": "-1,0,1",
                "width": "100%",
                "height": 550
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Hotlists Widget (Stock Market)
    useEffect(() => {
        const container = document.getElementById('stock-market-widget');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "exchange": "US",
                "colorTheme": "light",
                "dateRange": "12M",
                "showChart": true,
                "locale": "en",
                "largeChartUrl": "",
                "isTransparent": false,
                "showSymbolLogo": false,
                "showFloatingTooltip": false,
                "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
                "plotLineColorFalling": "rgba(41, 98, 255, 1)",
                "gridLineColor": "rgba(240, 243, 250, 0)",
                "scaleFontColor": "#0F0F0F",
                "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
                "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
                "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
                "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
                "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
                "width": "100%",
                "height": "550"
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Market Overview Widget
    useEffect(() => {
        const container = document.getElementById('market-overview-widget');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "colorTheme": "light",
                "dateRange": "12M",
                "locale": "en",
                "largeChartUrl": "",
                "isTransparent": false,
                "showFloatingTooltip": false,
                "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
                "plotLineColorFalling": "rgba(41, 98, 255, 1)",
                "gridLineColor": "rgba(240, 243, 250, 0)",
                "scaleFontColor": "#0F0F0F",
                "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
                "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
                "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
                "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
                "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
                "tabs": [
                    {
                        "title": "Indices",
                        "symbols": [
                            { "s": "FOREXCOM:SPXUSD", "d": "S&P 500 Index" },
                            { "s": "FOREXCOM:NSXUSD", "d": "US 100 Cash CFD" },
                            { "s": "FOREXCOM:DJI", "d": "Dow Jones Industrial Average Index" },
                            { "s": "INDEX:NKY", "d": "Japan 225" },
                            { "s": "INDEX:DEU40", "d": "DAX Index" },
                            { "s": "FOREXCOM:UKXGBP", "d": "FTSE 100 Index" }
                        ],
                        "originalTitle": "Indices"
                    },
                    {
                        "title": "Futures",
                        "symbols": [
                            { "s": "BMFBOVESPA:ISP1!", "d": "S&P 500" },
                            { "s": "BMFBOVESPA:EUR1!", "d": "Euro" },
                            { "s": "CMCMARKETS:GOLD", "d": "Gold" },
                            { "s": "PYTH:WTI3!", "d": "WTI Crude Oil" },
                            { "s": "BMFBOVESPA:CCM1!", "d": "Corn" }
                        ],
                        "originalTitle": "Futures"
                    },
                    {
                        "title": "Bonds",
                        "symbols": [
                            { "s": "EUREX:FGBL1!", "d": "Euro Bund" },
                            { "s": "EUREX:FBTP1!", "d": "Euro BTP" },
                            { "s": "EUREX:FGBM1!", "d": "Euro BOBL" }
                        ],
                        "originalTitle": "Bonds"
                    },
                    {
                        "title": "Forex",
                        "symbols": [
                            { "s": "FX:EURUSD", "d": "EUR to USD" },
                            { "s": "FX:GBPUSD", "d": "GBP to USD" },
                            { "s": "FX:USDJPY", "d": "USD to JPY" },
                            { "s": "FX:USDCHF", "d": "USD to CHF" },
                            { "s": "FX:AUDUSD", "d": "AUD to USD" },
                            { "s": "FX:USDCAD", "d": "USD to CAD" }
                        ],
                        "originalTitle": "Forex"
                    }
                ],
                "support_host": "https://www.tradingview.com",
                "width": "100%",
                "height": "550",
                "showSymbolLogo": true,
                "showChart": true
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Forex Cross Rates Widget
    useEffect(() => {
        const container = document.getElementById('forex-cross-rates-widget');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "colorTheme": "light",
                "isTransparent": false,
                "locale": "en",
                "currencies": ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"],
                "backgroundColor": "#ffffff",
                "width": "100%",
                "height": 400
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Crypto Heatmap Widget
    useEffect(() => {
        const container = document.getElementById('crypto-heatmap-widget');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "dataSource": "Crypto",
                "blockSize": "market_cap_calc",
                "blockColor": "24h_close_change|5",
                "locale": "en",
                "symbolUrl": "",
                "colorTheme": "dark",
                "hasTopBar": false,
                "isDataSetEnabled": false,
                "isZoomEnabled": true,
                "hasSymbolTooltip": true,
                "isMonoSize": false,
                "width": "100%",
                "height": 550
            });
            container.appendChild(script);
        }
    }, [activeTab, loading]);

    // Load TradingView Screener Widget for "All Stocks" tab
    useEffect(() => {
        if (activeTab === 'stocks') {
            const container = document.getElementById('admin-all-stocks-widget');
            if (container) {
                container.innerHTML = '';
                const widgetDiv = document.createElement('div');
                widgetDiv.className = 'tradingview-widget-container__widget';
                container.appendChild(widgetDiv);

                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
                script.async = true;
                script.type = 'text/javascript';
                script.innerHTML = JSON.stringify({
                    "width": "100%",
                    "height": "100%",
                    "defaultColumn": "overview",
                    "defaultScreen": "most_capitalized",
                    "market": "america",
                    "showToolbar": true,
                    "colorTheme": "dark",
                    "locale": "en",
                    "isTransparent": false
                });
                container.appendChild(script);
            }
        }
    }, [activeTab]);

    const fetchData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);

            const kycRes = await api.get('/admin/kyc-pending');
            setKycs(kycRes.data);

            const transRes = await api.get('/admin/transactions');
            setTransactions(transRes.data);

            const contactsRes = await api.get('/admin/contacts');
            setContacts(contactsRes.data);

            const settingsRes = await api.get('/admin/payment-settings');
            setPaymentSettings(settingsRes.data);

            const stocksRes = await api.get('/admin/stocks');
            const parsedStocks = stocksRes.data.map(s => ({
                ...s,
                value: parseFloat(s.value),
                change: parseFloat(s.change),
                chgPct: parseFloat(s.chgPct),
                open: parseFloat(s.open),
                high: parseFloat(s.high),
                low: parseFloat(s.low),
                prev: parseFloat(s.prev)
            }));
            setStocks(parsedStocks);

            const supportRes = await api.get('/admin/support/tickets');
            setSupportTickets(supportRes.data);

            const meRes = await api.get('/admin/me');
            setUserProfile(meRes.data);
            setBalances({
                funding: parseFloat(meRes.data.funding_balance),
                holding: parseFloat(meRes.data.holding_balance)
            });
        } catch (err) {
            console.error("Fetch data error:", err);
            // Only set error if it's not a background refresh, to avoid disrupting the UI
            if (!isBackground) setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const handleKycAction = async (id, status, reason = '') => {
        try {
            await api.post(`/admin/kyc-update/${id}`, { status, rejection_reason: reason });
            // Refresh data without full spinner
            fetchData(true);
            showToast(`KYC ${status} successfully`, 'success');
        } catch (err) {
            showToast('Action failed', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchData(true);
            showToast('User deleted successfully');
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        const amt = parseFloat(transferData.amount);
        if (isNaN(amt) || amt <= 0) {
            showToast('Please enter a valid amount', 'info');
            return;
        }

        try {
            const res = await api.post('/admin/transfer', transferData);
            setBalances({
                funding: parseFloat(res.data.user.funding_balance),
                holding: parseFloat(res.data.user.holding_balance)
            });
            showToast(res.data.message);
            setTransferData({ ...transferData, amount: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Transfer failed', 'error');
        }
    };

    const handleTransactionUpdate = async (id, status) => {
        try {
            await api.post(`/admin/transaction-update/${id}`, { status });
            showToast(`Transaction ${status} successfully!`);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectionReason('');
    };

    const submitRejection = (id) => {
        if (!rejectionReason.trim()) {
            showToast('Please enter a reason', 'error');
            return;
        }
        handleKycAction(id, 'rejected', rejectionReason);
        setRejectingId(null);
        setRejectionReason('');
    };

    const cancelRejection = () => {
        setRejectingId(null);
        setRejectionReason('');
    };

    const renderContent = () => {
        if (loading && activeTab !== 'stocks' && activeTab !== 'transfer' && activeTab !== 'deposits') return <div className="loading-spinner">Loading dashboard data...</div>;

        switch (activeTab) {
            case 'dashboard':
                // Calculate System Stats
                const totalUsers = users.length;
                const totalSystemFunding = users.reduce((acc, u) => acc + parseFloat(u.funding_balance || 0), 0);
                const totalSystemHoldings = users.reduce((acc, u) => acc + parseFloat(u.holding_balance || 0), 0);
                const totalSystemAssets = totalSystemFunding + totalSystemHoldings;

                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-content">
                        {/* System Stats Row */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Users</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalUsers}</div>
                                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Registered on platform</div>
                            </div>
                            <div className="stat-card">
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total System Assets</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${totalSystemAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Combined user balances</div>
                            </div>
                        </div>

                        {/* KYC Banner */}


                        <div className="quick-actions-grid">
                            <div className="action-item" onClick={() => { setActiveTab('deposits'); setFinanceTab('new-deposit'); setPaymentMethod('bank'); }}>
                                <div className="action-icon-box"><FaWallet /></div>
                                <span>Deposit</span>
                            </div>
                            <div className="action-item" onClick={() => setActiveTab('kyc')}>
                                <div className="action-icon-box"><FaMoneyBillWave /></div>
                                <span>Withdraw</span>
                            </div>
                            <div className="action-item" onClick={() => { setActiveTab('transfer'); setFinanceTab('transfer'); }}>
                                <div className="action-icon-box"><FaExchangeAlt /></div>
                                <span>Transfer</span>
                            </div>
                            <div className="action-item" onClick={() => setActiveTab('support')}>
                                <div className="action-icon-box"><FaChartLine /></div>
                                <span>Support</span>
                            </div>
                        </div>

                        <div className="dashboard-tabs-container">
                            <div className="dashboard-tabs">
                                <button
                                    className={`dash-tab ${dashboardTab === 'account' ? 'active' : ''}`}
                                    onClick={() => setDashboardTab('account')}
                                >
                                    Account
                                </button>
                                <button
                                    className={`dash-tab ${dashboardTab === 'assets' ? 'active' : ''}`}
                                    onClick={() => setDashboardTab('assets')}
                                >
                                    Assets
                                </button>
                            </div>
                            <div className="tab-underline"></div>
                        </div>

                        <div className="dashboard-tab-content">
                            {dashboardTab === 'account' ? (
                                <div className="account-list">
                                    <div className="balance-row">
                                        <div className="balance-info">
                                            <span className="balance-name">Funding</span>
                                            <span className="balance-amount">${balances.funding.toFixed(2)} USD</span>
                                        </div>
                                        <FaChevronRight className="row-arrow" />
                                    </div>
                                    <div className="balance-row">
                                        <div className="balance-info">
                                            <span className="balance-name">Holdings</span>
                                            <span className="balance-amount">${balances.holding.toFixed(2)} USD</span>
                                        </div>
                                        <FaChevronRight className="row-arrow" />
                                    </div>
                                    <div className="balance-row">
                                        <div className="balance-info">
                                            <span className="balance-name">Total Withdraw</span>
                                            <span className="balance-amount">$0.00 USD</span>
                                        </div>
                                        <FaChevronRight className="row-arrow" />
                                    </div>
                                    <div className="balance-row">
                                        <div className="balance-info">
                                            <span className="balance-name">Bonus</span>
                                            <span className="balance-amount">$0.00 USD</span>
                                        </div>
                                        <FaChevronRight className="row-arrow" />
                                    </div>
                                </div>
                            ) : (
                                <div className="assets-list-placeholder">
                                    <p style={{ color: 'var(--text-muted)', padding: '20px' }}>No assets currently held.</p>
                                </div>
                            )}
                        </div>

                        {/* TradingView Ticker Tape */}
                        <div className="tradingview-widget-container" id="tradingview-widget-container" style={{ margin: '20px 0' }}>
                            <div className="tradingview-widget-container__widget"></div>
                        </div>

                        {/* Market Widgets Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            {/* Economic Calendar */}
                            <div className="data-card" style={{ padding: '20px', minHeight: '600px' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Economic Calendar</h3>
                                <div className="tradingview-widget-container" id="economic-calendar-widget" style={{ width: '100%', height: '550px' }}>
                                    <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                </div>
                            </div>

                            {/* Market Overview */}
                            <div className="data-card" style={{ padding: '20px', minHeight: '600px' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Market Overview</h3>
                                <div className="tradingview-widget-container" id="market-overview-widget" style={{ width: '100%', height: '550px' }}>
                                    <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                </div>
                            </div>

                            {/* Stocks Today */}
                            <div className="data-card" style={{ padding: '20px', minHeight: '600px' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Stocks Today</h3>
                                <div className="tradingview-widget-container" id="stock-market-widget" style={{ width: '100%', height: '550px' }}>
                                    <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                </div>
                            </div>

                            {/* Forex Cross Rates */}
                            <div className="data-card" style={{ padding: '20px', minHeight: '450px' }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Forex Rates</h3>
                                <div className="tradingview-widget-container" id="forex-cross-rates-widget" style={{ width: '100%', height: '400px' }}>
                                    <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Crypto Heatmap */}
                        <div className="data-card" style={{ padding: '20px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Crypto Market Heatmap</h3>
                            <div className="tradingview-widget-container" id="crypto-heatmap-widget" style={{ width: '100%', height: '550px' }}>
                                <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                            </div>
                        </div>


                    </motion.div>
                );
            case 'users':
                return (
                    <div className="data-card">
                        <div className="data-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Funding</th>
                                        <th>Holdings</th>
                                        <th>KYC Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`status-badge ${u.is_admin ? 'completed' : 'pending'}`}>
                                                    {u.is_admin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td>${parseFloat(u.funding_balance).toFixed(2)}</td>
                                            <td>${parseFloat(u.holding_balance).toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${u.kyc_record?.status || 'none'}`}>
                                                    {u.kyc_record?.status || 'Not Submitted'}
                                                </span>
                                            </td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );


            case 'kyc':
                return (
                    <div className="data-card">
                        <div className="data-table-container">
                            <h3>All KYC Submissions</h3>
                            {kycs.length === 0 ? (
                                <p style={{ padding: '20px', color: 'var(--text-muted)' }}>No pending submissions.</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Doc Type</th>
                                            <th>Doc Number</th>
                                            <th>Documents</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kycs.map(k => (
                                            <tr key={k.id}>
                                                <td>
                                                    <strong>{k.user.name}</strong><br />
                                                    <small>{k.user.email}</small>
                                                </td>
                                                <td>
                                                    {k.document_type === 'id_card' ? 'Photo ID / Medicare' :
                                                        k.document_type === 'driving_license' ? 'Driving License' :
                                                            k.document_type.charAt(0).toUpperCase() + k.document_type.slice(1)}
                                                </td>
                                                <td>{k.document_number}</td>
                                                <td>
                                                    <a href={`http://127.0.0.1:8000/storage/${k.document_front_image_path}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginRight: '10px' }}>Front</a>
                                                    {k.document_back_image_path && (
                                                        <a href={`http://127.0.0.1:8000/storage/${k.document_back_image_path}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>Back</a>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${k.status ? k.status.toLowerCase() : 'pending'}`}>
                                                        {k.status ? k.status.charAt(0).toUpperCase() + k.status.slice(1) : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>{new Date(k.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    {k.status === 'pending' || !k.status ? (
                                                        rejectingId === k.id ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                <input
                                                                    type="text"
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    placeholder="Reason for rejection..."
                                                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                                    autoFocus
                                                                />
                                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                                    <button onClick={() => submitRejection(k.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Confirm</button>
                                                                    <button onClick={cancelRejection} style={{ background: '#94a3b8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <button
                                                                    onClick={() => handleKycAction(k.id, 'approved')}
                                                                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectClick(k.id)}
                                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                            {k.status === 'approved' ? '✅ Verified' : '❌ Rejected'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );
            case 'stocks':
                return (
                    <div className="data-card" style={{ height: '85vh', padding: '0', overflow: 'hidden' }}>
                        <div className="tradingview-widget-container" id="admin-all-stocks-widget" style={{ height: '100%', width: '100%' }}></div>
                    </div>
                );
            case 'support':
                return (
                    <div className="data-card">
                        {viewTicket ? (
                            <div className="ticket-detail-view" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '8px', color: 'var(--text-main)' }}>
                                <button onClick={() => setViewTicket(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '15px' }}>
                                    ← Back to List
                                </button>

                                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2>[#{viewTicket.ticket_number}] {viewTicket.subject}</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>User: {viewTicket.user?.name} ({viewTicket.user?.email})</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span className={`status-badge ${viewTicket.status.toLowerCase().replace(' ', '_')}`}>{viewTicket.status}</span>
                                        {viewTicket.status !== 'Closed' && (
                                            <button onClick={handleAdminCloseTicket} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                                                Close Ticket
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="messages-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                    {viewTicket.messages?.map((msg, idx) => (
                                        <div key={idx} style={{
                                            alignSelf: msg.user?.email === userProfile?.email ? 'flex-end' : 'flex-start',
                                            background: msg.user?.email === userProfile?.email ? '#1e293b' : '#334155',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            maxWidth: '70%'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                                                {msg.user?.name} • {new Date(msg.created_at).toLocaleString()}
                                            </div>
                                            <div>{msg.message}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-reply-box" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                    <textarea
                                        value={adminReplyMsg}
                                        onChange={(e) => setAdminReplyMsg(e.target.value)}
                                        placeholder="Type admin reply..."
                                        style={{ width: '100%', minHeight: '100px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}
                                    ></textarea>

                                    {adminReplyFiles.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                            {adminReplyFiles.map((f, i) => (
                                                <span key={i} style={{ background: '#334155', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {f.name} <span onClick={() => removeAdminFile(i)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="file"
                                            multiple
                                            ref={adminReplyFileRef}
                                            style={{ display: 'none' }}
                                            onChange={handleAdminFileChange}
                                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        />
                                        <button
                                            onClick={() => adminReplyFileRef.current.click()}
                                            style={{ background: '#475569', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            + Attach
                                        </button>
                                        <button
                                            onClick={handleAdminReply}
                                            disabled={!adminReplyMsg.trim() && adminReplyFiles.length === 0}
                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Send Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : supportTab === 'new-ticket' ? (
                            <div className="open-ticket-card" style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '4px' }}>
                                <form className="ticket-form" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    // Append files manually
                                    newTicketFiles.forEach(file => {
                                        formData.append('attachments[]', file);
                                    });

                                    try {
                                        await api.post('/support/tickets', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        showToast('Ticket created successfully!');
                                        setSupportTab('my-tickets');
                                        setNewTicketFiles([]);
                                        fetchData();
                                    } catch (err) {
                                        showToast(err.response?.data?.message || 'Failed to create ticket', 'error');
                                    }
                                }}>
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>Subject<span style={{ color: '#ef4444' }}>*</span></label>
                                            <input name="subject" type="text" className="ticket-input" placeholder="Enter Subject" required
                                                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '12px', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>Priority<span style={{ color: '#ef4444' }}>*</span></label>
                                            <select name="priority" className="ticket-select" required
                                                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '12px', borderRadius: '4px' }}
                                            >
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>Message<span style={{ color: '#ef4444' }}>*</span></label>
                                        <textarea name="message" className="ticket-textarea" placeholder="Enter Message" required
                                            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '12px', borderRadius: '4px', minHeight: '150px' }}
                                        ></textarea>
                                    </div>

                                    {newTicketFiles.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                            {newTicketFiles.map((f, i) => (
                                                <span key={i} style={{ background: '#334155', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {f.name} <span onClick={() => removeNewTicketFile(i)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="file"
                                                multiple
                                                ref={newTicketFileRef}
                                                style={{ display: 'none' }}
                                                onChange={handleNewTicketFileChange}
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                            />
                                            <button type="button" onClick={() => newTicketFileRef.current.click()} className="add-attachment-btn" style={{ background: '#4A9FD4', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold' }}>+ Add Attachment</button>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px', maxWidth: '500px' }}>Max 5 files can be uploaded | Maximum upload size is 256MB | Allowed File Extensions: .jpg, .jpeg, .png, .pdf, .doc, .docx</p>
                                        </div>
                                        <button type="submit" className="ticket-submit-btn blue-gradient-btn" style={{ background: 'linear-gradient(90deg, #4A9FD4 0%, #0077b6 100%)', color: '#fff', border: 'none', padding: '12px 40px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            <span style={{ marginRight: '8px' }}>➤</span> Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="data-table-container">
                                <h3>All Support Tickets</h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>User</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                            <th>Last Update</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supportTickets.map(t => (
                                            <tr key={t.id}>
                                                <td>
                                                    <span style={{ background: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                        {t.ticket_number}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{t.user?.name}</strong><br />
                                                    <small style={{ color: 'var(--text-muted)' }}>{t.user?.email}</small>
                                                </td>
                                                <td style={{ color: '#3b82f6', fontWeight: '500' }}>{t.subject}</td>
                                                <td>
                                                    <span className={`status-badge ${t.status?.toLowerCase().replace(' ', '_')}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`priority-badge ${t.priority?.toLowerCase()}`}>{t.priority}</span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.updated_at).toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        onClick={() => fetchAdminTicketDetails(t.id)}
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'transfer':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="finance-section">
                        <div className="transfer-hub">
                            <div className="balance-grid" style={{ marginBottom: '30px' }}>
                                <div className="balance-box" style={{ background: '#0f172a', padding: '30px', borderRadius: '12px', color: 'white' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Funding Balance</span>
                                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>${balances.funding.toFixed(2)} USD</h2>
                                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● Available</span>
                                </div>
                                <div className="balance-box" style={{ background: '#0f172a', padding: '30px', borderRadius: '12px', color: 'white' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Holding Balance</span>
                                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>${balances.holding.toFixed(2)} USD</h2>
                                    <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>● In-Work</span>
                                </div>
                            </div>

                            <form onSubmit={handleTransfer} className="transfer-form-card" style={{ background: '#0f172a', padding: '40px', borderRadius: '12px', maxWidth: '600px' }}>
                                <h3 style={{ color: 'white', marginBottom: '25px' }}>Transfer Your Balance</h3>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Enter Amount</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                        placeholder="0.00"
                                        value={transferData.amount}
                                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                    <div className="form-group">
                                        <label style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Transfer From</label>
                                        <select
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                            value={transferData.from}
                                            onChange={(e) => {
                                                const fromVal = e.target.value;
                                                const toVal = fromVal === 'funding' ? 'holding' : 'funding';
                                                setTransferData({ ...transferData, from: fromVal, to: toVal });
                                            }}
                                        >
                                            <option value="funding">Funding Balance</option>
                                            <option value="holding">Holding Balance</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Transfer To</label>
                                        <select
                                            style={{ width: '100%', background: '#1d283a', border: '1px solid #334155', color: '#94a3b8', padding: '12px', borderRadius: '6px', cursor: 'not-allowed' }}
                                            value={transferData.to}
                                            disabled
                                        >
                                            <option value="holding">Holding Balance</option>
                                            <option value="funding">Funding Balance</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="make-payment-btn" style={{ background: '#0077b6', color: 'white', width: '100%', padding: '15px', fontWeight: '700' }}>Transfer Now</button>
                            </form>
                        </div>
                    </motion.div>
                );
            case 'deposits':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="finance-section">
                        <div className="finance-tabs" style={{ display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' }}>
                            <button
                                className={`finance-tab-link ${financeTab === 'new-deposit' ? 'active' : ''}`}
                                onClick={() => setFinanceTab('new-deposit')}
                                style={{ padding: '15px 5px', borderBottom: financeTab === 'new-deposit' ? '3px solid #0077b6' : '3px solid transparent', color: financeTab === 'new-deposit' ? '#0077b6' : '#64748b', fontWeight: financeTab === 'new-deposit' ? '700' : '500', transition: 'all 0.3s' }}
                            >
                                New Deposit
                            </button>
                            <button
                                className={`finance-tab-link ${financeTab === 'deposit-history' ? 'active' : ''}`}
                                onClick={() => setFinanceTab('deposit-history')}
                                style={{ padding: '15px 5px', borderBottom: financeTab === 'deposit-history' ? '3px solid #0077b6' : '3px solid transparent', color: financeTab === 'deposit-history' ? '#0077b6' : '#64748b', fontWeight: financeTab === 'deposit-history' ? '700' : '500', transition: 'all 0.3s' }}
                            >
                                Deposit History
                            </button>
                        </div>

                        {(financeTab === 'new-deposit' || financeTab === 'transfer') && (
                            <div className="deposit-container">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className="make-payment-btn"
                                    style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '0.8rem' }}
                                >
                                    Back to Dashboard
                                </button>
                                <div className="saved-cards-grid">
                                    <div className={`payment-card ${selectedSavedCard === 'visa' ? 'active-selection' : ''}`} onClick={() => setSelectedSavedCard('visa')} style={{ position: 'relative', border: selectedSavedCard === 'visa' ? '2px solid #0077b6' : '1px solid #edf2f7', cursor: 'pointer' }}>
                                        <div className="card-brand visa"><SiVisa size={40} /></div>
                                        <div className="card-number-display">**** **** **** 4242</div>
                                        <div className="card-info-row">
                                            <span>Expiry date: 00/00</span>
                                            <span>Name: Your Name</span>
                                        </div>
                                        {selectedSavedCard === 'visa' && <div style={{ position: 'absolute', top: '15px', right: '15px', color: '#0077b6', fontWeight: 'bold', fontSize: '0.7rem' }}>SELECTED</div>}
                                    </div>
                                    <div className={`payment-card ${selectedSavedCard === 'mastercard' ? 'active-selection' : ''}`} onClick={() => setSelectedSavedCard('mastercard')} style={{ position: 'relative', border: selectedSavedCard === 'mastercard' ? '2px solid #0077b6' : '1px solid #edf2f7', cursor: 'pointer' }}>
                                        <div className="card-brand mastercard"><SiMastercard size={40} /></div>
                                        <div className="card-number-display">**** **** **** 5555</div>
                                        <div className="card-info-row">
                                            <span>Expiry date: 00/00</span>
                                            <span>Name: Your Name</span>
                                        </div>
                                        {selectedSavedCard === 'mastercard' && <div style={{ position: 'absolute', top: '15px', right: '15px', color: '#0077b6', fontWeight: 'bold', fontSize: '0.7rem' }}>SELECTED</div>}
                                    </div>
                                    <div className={`payment-card ${selectedSavedCard === 'discover' ? 'active-selection' : ''}`} onClick={() => setSelectedSavedCard('discover')} style={{ position: 'relative', border: selectedSavedCard === 'discover' ? '2px solid #0077b6' : '1px solid #edf2f7', cursor: 'pointer' }}>
                                        <div className="card-brand discover"><SiDiscover size={40} /></div>
                                        <div className="card-number-display">**** **** **** 0000</div>
                                        <div className="card-info-row">
                                            <span>Expiry date: 00/00</span>
                                            <span>Name: Your Name</span>
                                        </div>
                                        {selectedSavedCard === 'discover' && <div style={{ position: 'absolute', top: '15px', right: '15px', color: '#0077b6', fontWeight: 'bold', fontSize: '0.7rem' }}>SELECTED</div>}
                                    </div>
                                </div>

                                <div className="payment-method-section">
                                    <div className="section-header">Payment method</div>
                                    <div
                                        className={`method-item ${paymentMethod === 'bank' ? 'active-method' : ''}`}
                                        onClick={() => setPaymentMethod('bank')}
                                    >
                                        <span className="method-name" style={{ color: paymentMethod === 'bank' ? '#0077b6' : 'inherit', textDecoration: paymentMethod === 'bank' ? 'underline' : 'none' }}>Bank Transfer</span>
                                        <span className="method-icons"><FaUniversity color="#64748b" size={20} /></span>
                                    </div>
                                    <div
                                        className={`method-item ${paymentMethod === 'crypto' ? 'active-method' : ''}`}
                                        onClick={() => setPaymentMethod('crypto')}
                                    >
                                        <span className="method-name" style={{ color: paymentMethod === 'crypto' ? '#0077b6' : 'inherit', textDecoration: paymentMethod === 'crypto' ? 'underline' : 'none' }}>Cryptocurrency</span>
                                        <span className="method-icons"><FaBitcoin color="#f7931a" size={20} /></span>
                                    </div>
                                    <div
                                        className={`method-item ${paymentMethod === 'card' ? 'active-method' : ''}`}
                                        style={{ borderBottom: 'none' }}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <span className="method-name" style={{ color: paymentMethod === 'card' ? '#0077b6' : 'inherit', textDecoration: paymentMethod === 'card' ? 'underline' : 'none' }}>Credit Card</span>
                                        <span className="method-icons" style={{ display: 'flex', gap: '5px' }}>
                                            <SiAmericanexpress color="#007bc1" size={18} />
                                            <SiMastercard color="#eb001b" size={18} />
                                            <SiDiscover color="#ff6000" size={18} />
                                        </span>
                                    </div>

                                    <div className="payment-details-container">
                                        <div className="details-info">
                                            <h3>{paymentMethod === 'card' ? 'Payment Details' : 'Details'}</h3>
                                            <p><strong>Product::</strong> Fund Account</p>
                                            {paymentMethod === 'card' && (
                                                <>
                                                    <p>All Card information and payment processing are secured with <strong>SSL Secure Payment</strong>. Your encryption is protected by 256-bit SSL encryption.</p>
                                                    <p>By proceeding with this payment option, you agree with our <button className="link-btn" onClick={() => navigate('/terms')}>Terms of Service</button> and confirm that you have read our <button className="link-btn" onClick={() => navigate('/privacy')}>Privacy Policy</button>. You can cancel payment at any time.</p>
                                                </>
                                            )}
                                            {paymentMethod === 'bank' && (
                                                <>
                                                    <p>All deposits done using this channel will be processed by your Bank. Your account will automatically be funded as soon as the payment is confirmed. Thank you for choosing Investment Smart Crypto Investing.</p>
                                                </>
                                            )}
                                            {paymentMethod === 'crypto' && (
                                                <>
                                                    <p>All deposits done using this channel will be processed by your Wallet/Exchange. Your account will automatically be funded as soon as the payment is confirmed on the Blockchain. Thank you for choosing Investment Smart Crypto Investing.</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="payment-form">
                                            {paymentMethod === 'card' ? (
                                                <Elements stripe={stripePromise}>
                                                    <DepositForm
                                                        showToast={showToast}
                                                        onSuccess={() => {
                                                            fetchData();
                                                            setFinanceTab('deposit-history');
                                                        }}
                                                    />
                                                </Elements>
                                            ) : paymentMethod === 'bank' ? (
                                                <BankDepositForm
                                                    settings={paymentSettings?.bank}
                                                    showToast={showToast}
                                                    onSuccess={() => {
                                                        fetchData();
                                                        setFinanceTab('deposit-history');
                                                    }}
                                                />
                                            ) : (
                                                <CryptoDepositForm
                                                    settings={paymentSettings?.crypto}
                                                    showToast={showToast}
                                                    onSuccess={() => {
                                                        fetchData();
                                                        setFinanceTab('deposit-history');
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {financeTab === 'deposit-history' && (
                            <div className="deposit-history-view">
                                <div className="data-card">
                                    <div className="data-table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Method</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.filter(t => t.type === 'deposit').map(t => (
                                                    <tr key={t.id}>
                                                        <td>{new Date(t.created_at).toLocaleString()}</td>
                                                        <td style={{ textTransform: 'capitalize' }}>
                                                            {t.from_account === 'external' ? 'Credit Card' : t.from_account}
                                                        </td>
                                                        <td style={{ fontWeight: '700' }}>${parseFloat(t.amount).toFixed(2)}</td>
                                                        <td>
                                                            <span className={`status-badge ${t.status}`}>
                                                                {t.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {t.status === 'pending' && (
                                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                                    <button
                                                                        onClick={() => handleTransactionUpdate(t.id, 'completed')}
                                                                        className="kyc-action-btn approve"
                                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleTransactionUpdate(t.id, 'rejected')}
                                                                        className="kyc-action-btn reject"
                                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {transactions.filter(t => t.type === 'deposit').length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No deposit history found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            case 'history':
                const filteredTransactions = transactions.filter(t => {
                    const matchNumber = historyFilters.number ? t.id.toString().includes(historyFilters.number) : true;
                    let matchType = true;
                    if (historyFilters.type === 'plus') matchType = t.amount > 0 && (t.type === 'deposit' || (t.type === 'transfer' && t.to_account === 'funding'));
                    if (historyFilters.type === 'minus') matchType = t.amount > 0 && (t.type === 'withdraw' || (t.type === 'transfer' && t.from_account === 'funding'));
                    if (historyFilters.type === 'pending') matchType = t.status === 'pending';

                    let matchRemark = true;
                    if (historyFilters.remark === 'Balance add') matchRemark = t.type === 'deposit';
                    if (historyFilters.remark === 'Withdraw') matchRemark = t.type === 'withdraw';

                    return matchNumber && matchType && matchRemark;
                });

                return (
                    <div className="transaction-history-view">
                        <div className="filter-bar-card">
                            <div className="filter-grid">
                                <div className="filter-item">
                                    <label>Transaction Number</label>
                                    <input
                                        type="text"
                                        placeholder="Search by ID..."
                                        value={historyFilters.number}
                                        onChange={(e) => setHistoryFilters({ ...historyFilters, number: e.target.value })}
                                    />
                                </div>
                                <div className="filter-item">
                                    <label>Type</label>
                                    <select
                                        value={historyFilters.type}
                                        onChange={(e) => setHistoryFilters({ ...historyFilters, type: e.target.value })}
                                    >
                                        <option value="all">All</option>
                                        <option value="plus">Plus</option>
                                        <option value="minus">Minus</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div className="filter-item">
                                    <label>Remark</label>
                                    <select
                                        value={historyFilters.remark}
                                        onChange={(e) => setHistoryFilters({ ...historyFilters, remark: e.target.value })}
                                    >
                                        <option value="any">Any</option>
                                        <option value="Balance add">Balance add</option>
                                        <option value="Withdraw">Withdraw</option>
                                    </select>
                                </div>
                                <div className="filter-item">
                                    <label>Stock</label>
                                    <select
                                        value={historyFilters.stock}
                                        onChange={(e) => setHistoryFilters({ ...historyFilters, stock: e.target.value })}
                                    >
                                        <option value="all">All</option>
                                    </select>
                                </div>
                                <div className="filter-item btn-align">
                                    <button className="filter-btn-themed">Filter</button>
                                </div>
                            </div>
                        </div>

                        <div className="transaction-results-card">
                            {filteredTransactions.length > 0 ? (
                                <div className="data-table-container">
                                    <table className="admin-table dark-themed-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Method/Accounts</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map(t => (
                                                <tr key={t.id}>
                                                    <td>{new Date(t.created_at).toLocaleString()}</td>
                                                    <td>{t.user?.name}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                                                    <td style={{ textTransform: 'capitalize' }}>
                                                        {t.type === 'transfer'
                                                            ? `${t.from_account} → ${t.to_account}`
                                                            : (t.from_account === 'external' ? 'Credit Card' : t.from_account)}
                                                    </td>
                                                    <td style={{ fontWeight: '700', color: t.type === 'deposit' ? '#10b981' : '#ef4444' }}>
                                                        {t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${t.status}`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {t.status === 'pending' && (
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button onClick={() => handleTransactionUpdate(t.id, 'completed')} className="kyc-action-btn approve" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Approve</button>
                                                                <button onClick={() => handleTransactionUpdate(t.id, 'rejected')} className="kyc-action-btn reject" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Reject</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-transaction-state">
                                    <div className="empty-icon">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                            <path d="M9 14h6"></path>
                                            <path d="M9 10h6"></path>
                                            <path d="M9 18h6"></path>
                                        </svg>
                                    </div>
                                    <p>No transaction found</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'contacts':
                return (
                    <div className="data-card">
                        <div className="data-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Message</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.length > 0 ? (
                                        contacts.map(c => (
                                            <tr key={c.id}>
                                                <td>{c.first_name} {c.last_name}</td>
                                                <td>{c.email}</td>
                                                <td>{c.phone}</td>
                                                <td>{c.message}</td>
                                                <td>{new Date(c.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No contact queries found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'referrals':
                const referralLink = `https://investment-smart-crypto.com?reference=${userProfile?.name?.replace(/\s+/g, '') || 'username'}`;
                return (
                    <div className="referral-view">
                        <div className="section-header-card">
                            <h2 style={{ color: '#94a3b8', fontSize: '1.25rem', fontWeight: '600' }}>{referralTab === 'link' ? 'Manage Referral' : 'My Referrals'}</h2>
                        </div>

                        {referralTab === 'link' ? (
                            <div className="referral-link-card">
                                <label className="referral-label">Referral Link</label>
                                <div className="referral-input-container">
                                    <input
                                        type="text"
                                        className="referral-input"
                                        value={referralLink}
                                        readOnly
                                    />
                                    <button
                                        className="referral-copy-btn"
                                        onClick={() => {
                                            navigator.clipboard.writeText(referralLink);
                                            showToast('Referral link copied to clipboard!');
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="my-referrals-list">
                                <div className="data-table-container">
                                    <table className="dark-themed-table">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.referred_by === userProfile?.id).length > 0 ? (
                                                users.filter(u => u.referred_by === userProfile?.id).map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.name}</td>
                                                        <td>{u.email}</td>
                                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No referred users found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="#4A9FD4" stroke="#4A9FD4" strokeWidth="2" />
                        </svg>
                    </div>
                    <span className="logo-text">Investment Smart Crypto Investing</span>
                </div>

                <ul className="sidebar-menu">
                    <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <span className="menu-icon">📊</span>
                        <span className="menu-text">Dashboard</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
                        <span className="menu-icon">📈</span>
                        <span className="menu-text">All Stocks</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'transfer' ? 'active' : ''}`} onClick={() => setActiveTab('transfer')}>
                        <span className="menu-icon">⇄</span>
                        <span className="menu-text">Transfer Balance</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'deposits' ? 'active' : ''}`} onClick={() => {
                        setActiveTab('deposits');
                        setFinanceTab('new-deposit');
                    }}>
                        <span className="menu-icon">🏦</span>
                        <span className="menu-text">My Deposits</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <span className="menu-icon">👥</span>
                        <span className="menu-text">All Users</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}>
                        <span className="menu-icon">🛡️</span>
                        <span className="menu-text">Manage KYC</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <span className="menu-icon">💸</span>
                        <span className="menu-text">Manage Transactions</span>
                    </li>
                    <li className={`menu-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
                        <span className="menu-icon">📧</span>
                        <span className="menu-text">Contact Queries</span>
                    </li>
                    <li className={`menu-item has-submenu ${activeTab === 'support' ? 'active' : ''}`}>
                        <div className="menu-item-main" onClick={() => setSupportSubmenuOpen(!supportSubmenuOpen)}>
                            <span className="menu-icon">🎫</span>
                            <span className="menu-text">Support Ticket</span>
                            <span className="submenu-arrow">{supportSubmenuOpen ? '▼' : '▶'}</span>
                        </div>
                        {supportSubmenuOpen && (
                            <ul className="submenu">
                                <li className={`submenu-item ${activeTab === 'support' && supportTab === 'new-ticket' ? 'active shadow-active' : ''}`}
                                    onClick={() => { setActiveTab('support'); setSupportTab('new-ticket'); }}>
                                    <span className="submenu-dot">○</span> New Ticket
                                </li>
                                <li className={`submenu-item ${activeTab === 'support' && supportTab === 'my-tickets' ? 'active shadow-active' : ''}`}
                                    onClick={() => { setActiveTab('support'); setSupportTab('my-tickets'); }}>
                                    <span className="submenu-dot">○</span> My Ticket
                                </li>
                            </ul>
                        )}
                    </li>
                    <li className={`menu-item has-submenu ${activeTab === 'referrals' ? 'active' : ''}`}>
                        <div className="menu-item-main" onClick={() => setReferralSubmenuOpen(!referralSubmenuOpen)}>
                            <span className="menu-icon">🔄</span>
                            <span className="menu-text">Manage Referrals</span>
                            <span className="submenu-arrow">{referralSubmenuOpen ? '▼' : '▶'}</span>
                        </div>
                        {referralSubmenuOpen && (
                            <ul className="submenu">
                                <li className={`submenu-item ${activeTab === 'referrals' && referralTab === 'link' ? 'active shadow-active' : ''}`}
                                    onClick={() => { setActiveTab('referrals'); setReferralTab('link'); }}>
                                    <span className="submenu-dot">○</span> Referral Link
                                </li>
                                <li className={`submenu-item ${activeTab === 'referrals' && referralTab === 'referred-users' ? 'active shadow-active' : ''}`}
                                    onClick={() => { setActiveTab('referrals'); setReferralTab('referred-users'); }}>
                                    <span className="submenu-dot">○</span> My Referral
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => {
                        logout();
                        window.location.href = '/login';
                    }}>Log Out</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-top-bar">
                    <div className="top-bar-left">
                        <h1 style={{ color: 'white' }}>
                            {activeTab === 'dashboard' ? 'Admin Dashboard' :
                                activeTab === 'stocks' ? 'Stocks List' :
                                    activeTab === 'transfer' ? 'Transfer Balance' :
                                        activeTab === 'deposits' ? 'Manage Transfer' :
                                            activeTab === 'users' ? 'All Users' :
                                                activeTab === 'kyc' ? 'Manage KYC' :
                                                    activeTab === 'history' ? 'Transaction History' :
                                                        activeTab === 'contacts' ? 'Contact Queries' :
                                                            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                    </div>

                    {activeTab === 'stocks' && (
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="search-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                    )}

                    {activeTab === 'transfer' && (
                        <button className="invest-now-btn">
                            <div className="flag"></div>
                            Invest Now
                        </button>
                    )}
                </header>

                <div>
                    {renderContent()}
                </div>
            </main>

            {/* Premium Toasts */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className={`toast-item ${toast.type}`}
                    >
                        <div className="toast-icon">
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'info' && 'ℹ️'}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                        <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>×</button>
                        <div className="toast-progress">
                            <motion.div
                                className="toast-progress-bar"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const BankDepositForm = ({ settings, onSuccess, showToast }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/deposit-request', { amount, method: 'bank' });
            showToast('Bank deposit request submitted! Please wait for approval.', 'info');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Request failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form-grid">
            <div className="bank-details-box">
                {settings ? settings.map(s => (
                    <div key={s.id} className="detail-item">
                        <label>{s.key}</label>
                        <span>{s.value}</span>
                    </div>
                )) : <p>Loading bank details...</p>}
            </div>
            <div className="input-group">
                <label>Amount to Deposit (USD)</label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="make-payment-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Proceed via Bank'}
            </button>
        </form>
    );
};

const CryptoDepositForm = ({ settings, onSuccess, showToast }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/deposit-request', { amount, method: 'crypto' });
            showToast('Crypto deposit request submitted! Please wait for approval.', 'info');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Request failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form-grid">
            <div className="bank-details-box">
                {settings ? settings.map(s => (
                    <div key={s.id} className="detail-item">
                        <label>{s.key}</label>
                        <span style={{ wordBreak: 'break-all' }}>{s.value}</span>
                    </div>
                )) : <p>Loading crypto details...</p>}
            </div>
            <div className="input-group">
                <label>Amount to Deposit (USD)</label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="proceed-crypto-btn" disabled={loading}>
                <FaBitcoin /> {loading ? 'Submitting...' : 'Proceed via Crypto'}
            </button>
        </form>
    );
};

const DepositForm = ({ onSuccess, showToast }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create intent
            const { data } = await api.post('/payment/create-intent', {
                amount: parseFloat(amount),
                currency: 'usd'
            });

            // 2. Confirm payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: { name: 'Admin User' }
                }
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Confirm on backend
                    await api.post('/payment/confirm', {
                        payment_intent_id: result.paymentIntent.id
                    });
                    showToast('Deposit Successful!');
                    onSuccess();
                }
            }
        } catch (err) {
            setError('Payment process failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form-grid">
            <div className="input-group">
                <label>CARD NUMBER</label>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px', position: 'relative' }}>
                    <CardElement options={{
                        style: {
                            base: { fontSize: '16px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } }
                        }
                    }} />
                    <FaCreditCard size={18} color="#cbd5e1" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                    <label>EXPIRATION DATE</label>
                    <input type="text" className="form-input" placeholder="MM / YY" />
                </div>
                <div className="input-group">
                    <label>CV CODE</label>
                    <input type="text" className="form-input" placeholder="CVC" />
                </div>
            </div>

            <div className="input-group">
                <label>NAME OF CARD</label>
                <input type="text" className="form-input" placeholder="NAME AND SURNAME" />
            </div>

            <div className="input-group">
                <label>DEPOSIT AMOUNT (USD)</label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}

            <button type="submit" className="make-payment-btn" disabled={!stripe || loading}>
                {loading ? 'Processing...' : 'Make a payment!'}
            </button>
        </form>
    );
};

export default AdminPanel;
