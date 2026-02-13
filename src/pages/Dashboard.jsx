import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Use context
    const [kycStatus, setKycStatus] = useState(null);
    const [totalWithdraw, setTotalWithdraw] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch KYC Status and Transactions in parallel (User is already in context)
                const [kycRes, txRes] = await Promise.all([
                    api.get('/kyc/status').catch(() => ({ data: { status: 'not_submitted' } })),
                    api.get('/transactions').catch(() => ({ data: [] }))
                ]);

                setKycStatus(kycRes.data.data?.status || 'not_submitted');

                // Calculate Total Withdrawals
                if (Array.isArray(txRes.data)) {
                    const withdrawals = txRes.data.filter(tx => tx.type === 'withdraw' && tx.status === 'completed');
                    const total = withdrawals.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                    setTotalWithdraw(total);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        } else {
            // User loading handled by AuthContext or Layout
        }
    }, [navigate, user]);

    // Widget 0: Ticker Tape
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-ticker-tape');
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
    }, [loading]);

    // Widget 1: Economic Calendar
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-economic-calendar');
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
    }, [loading]);



    // Widget 2: Stock Market (Hotlists)
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-stock-market');
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
                "showSymbolLogo": true,
                "showFloatingTooltip": false,
                "width": "100%",
                "height": 550
            });
            container.appendChild(script);
        }
    }, [loading]);

    // Widget 3: Market Overview
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-market-overview');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "colorTheme": "light",
                "dateRange": "12M",
                "showChart": true,
                "locale": "en",
                "largeChartUrl": "",
                "isTransparent": false,
                "showSymbolLogo": true,
                "showFloatingTooltip": false,
                "width": "100%",
                "height": 550,
                "tabs": [
                    { "title": "Indices", "symbols": [{ "s": "FOREXCOM:SPXUSD", "d": "S&P 500" }, { "s": "FOREXCOM:NSXUSD", "d": "US 100" }, { "s": "FOREXCOM:DJI", "d": "Dow 30" }, { "s": "INDEX:NKY", "d": "Nikkei 225" }, { "s": "INDEX:DEU40", "d": "DAX Index" }, { "s": "FOREXCOM:UKXGBP", "d": "UK 100" }] },
                    { "title": "Futures", "symbols": [{ "s": "CME_MINI:ES1!", "d": "S&P 500" }, { "s": "CME:6E1!", "d": "Euro" }, { "s": "COMEX:GC1!", "d": "Gold" }, { "s": "NYMEX:CL1!", "d": "Crude Oil" }, { "s": "NYMEX:NG1!", "d": "Natural Gas" }, { "s": "CBOT:ZC1!", "d": "Corn" }] },
                    { "title": "Bonds", "symbols": [{ "s": "CME:GE1!", "d": "Eurodollar" }, { "s": "CBOT:ZB1!", "d": "T-Bond" }, { "s": "CBOT:UB1!", "d": "Ultra T-Bond" }, { "s": "EUREX:FGBL1!", "d": "Euro Bund" }, { "s": "EUREX:FBTP1!", "d": "Euro BTP" }, { "s": "EUREX:FGBM1!", "d": "Euro BOBL" }] },
                    { "title": "Forex", "symbols": [{ "s": "FX:EURUSD", "d": "EUR/USD" }, { "s": "FX:GBPUSD", "d": "GBP/USD" }, { "s": "FX:USDJPY", "d": "USD/JPY" }, { "s": "FX:USDCHF", "d": "USD/CHF" }, { "s": "FX:AUDUSD", "d": "AUD/USD" }, { "s": "FX:USDCAD", "d": "USD/CAD" }] }
                ]
            });
            container.appendChild(script);
        }
    }, [loading]);

    // Widget 4: Forex Cross Rates
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-forex-rates');
        if (container) {
            container.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "width": "100%",
                "height": 550,
                "currencies": ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"],
                "isTransparent": false,
                "colorTheme": "light",
                "locale": "en"
            });
            container.appendChild(script);
        }
    }, [loading]);



    // Widget 6: Crypto Market (Heatmap)
    useEffect(() => {
        if (loading) return;
        const container = document.getElementById('dashboard-crypto-heatmap');
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
                "colorTheme": "light",
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
    }, [loading]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f7f9fc', color: '#334155' }}>Loading...</div>;
    }

    const showKycNotice = kycStatus !== 'approved';
    const totalAssets = (parseFloat(user?.funding_balance || 0) + parseFloat(user?.holding_balance || 0)).toFixed(2);

    const homeSections = [
        {
            title: 'Forex Cross Rates',
            description: 'This one allows you to display real-time quotes of selected currencies in comparison to other major currencies.',
            id: 'dashboard-forex-rates',
            link: 'https://www.tradingview.com/markets/currencies/'
        },
        {
            title: 'Market Overview',
            description: 'Built for when you need to take a macro look at the markets. This widget works particularly well on homepages.',
            id: 'dashboard-market-overview',
            link: 'https://www.tradingview.com/markets/'
        },
        {
            title: 'Stock Market',
            description: 'See the top five gaining, losing, and most active stocks for the day. It updates based on current market activity – so you\'ll always see the most relevant stocks.',
            id: 'dashboard-stock-market',
            link: 'https://www.tradingview.com/markets/stocks-usa/'
        },
        {
            title: 'Crypto Heatmap',
            description: 'A comprehensive view of the crypto market performance.',
            id: 'dashboard-crypto-heatmap',
            link: 'https://www.tradingview.com/markets/cryptocurrencies/'
        },
        {
            title: 'Economic Calendar',
            description: 'Keep an eye on key upcoming economic events, announcements, and news. Plus, set up filters in a few clicks, selecting for event importance and affected currencies.',
            id: 'dashboard-economic-calendar',
            link: 'https://www.tradingview.com/economic-calendar/'
        }
    ];

    return (
        <DashboardLayout activePage="dashboard">
            {/* Ticker Tape Widget */}
            <div className="tradingview-widget-container" id="dashboard-ticker-tape" style={{ marginBottom: '20px' }}>
                <div className="tradingview-widget-container__widget"></div>
            </div>


            {showKycNotice && (
                <div className="kyc-alert">
                    <h3>KYC Verification required</h3>
                    <p>
                        Complete KYC to unlock the full potential of our platform! KYC helps us verify your identity and keep things secure.
                        It is quick and easy just follow the on-screen instructions. Get started with KYC verification now!
                        {' '}<span className="kyc-link" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/kyc')}>Click Here to Submit Documents</span>
                    </p>
                </div>
            )}

            <div className="assets-section">
                <div className="total-assets-label">Total Assets</div>
                <h1 className="total-assets-value">${totalAssets} USD</h1>
            </div>



            {/* Quick Actions */}
            <div className="action-buttons">
                <div className="action-btn" onClick={() => navigate('/deposit/new')}>
                    <div className="action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span className="action-label">Deposit</span>
                </div>
                <div className="action-btn" onClick={() => navigate('/withdraw/new')}>
                    <div className="action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><path d="M12 5l7 7-7 7"></path></svg>
                    </div>
                    <span className="action-label">Withdraw</span>
                </div>
                <div className="action-btn" onClick={() => navigate('/transfer')}>
                    <div className="action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                    </div>
                    <span className="action-label">Transfer</span>
                </div>
                <div className="action-btn" onClick={() => navigate('/stocks')}>
                    <div className="action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    </div>
                    <span className="action-label">Invest</span>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button className="tab-btn active">Account</button>
                <button className="tab-btn">Assets</button>
            </div>

            <div className="balance-list">
                <div className="balance-item">
                    <div>
                        <span className="balance-label">Funding</span>
                        <span className="balance-amount">${parseFloat(user?.funding_balance || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="arrow-icon">›</div>
                </div>
                <div className="balance-item">
                    <div>
                        <span className="balance-label">Holdings</span>
                        <span className="balance-amount">${parseFloat(user?.holding_balance || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="arrow-icon">›</div>
                </div>
                <div className="balance-item">
                    <div>
                        <span className="balance-label">Total Withdraw</span>
                        <span className="balance-amount">${totalWithdraw.toFixed(2)} USD</span>
                    </div>
                    <div className="arrow-icon">›</div>
                </div>
                <div className="balance-item">
                    <div>
                        <span className="balance-label">Bonus</span>
                        <span className="balance-amount">$0.00 USD</span>
                    </div>
                    <div className="arrow-icon">›</div>
                </div>
            </div>

            {/* Widget Sections from Home Page */}
            {homeSections.map((section, index) => (
                <div key={index} className="etf-section" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
                    <div className="etf-header" style={{ flex: '0 0 30%', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>{section.title}</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>{section.description}</p>
                        <button
                            onClick={() => navigate('/stocks')}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#3b82f6',
                                border: 'none',
                                padding: '0',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Invest <span>→</span>
                        </button>
                    </div>
                    <div className="etf-list" style={{ flex: '1', display: 'block', height: '550px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                        <div className="tradingview-widget-container" id={section.id} style={{ width: '100%', height: '100%' }}></div>
                    </div>
                </div>
            ))}
        </DashboardLayout>
    );
};

export default Dashboard;
