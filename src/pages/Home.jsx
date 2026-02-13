import React, { useState } from 'react';
import './Home.css';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import CountUp from '../components/CountUp';
import heroImage from '../assets/hero-woman.png';
import avatar1 from '../assets/man.jpg';
import boxImage from '../assets/security-visual.png';

import { etfCategories, stockListings } from '../data/mockData';
import GlobalAvailabilityPopup from '../components/GlobalAvailabilityPopup';

const Home = () => {
    const navigate = useNavigate();

    const handleInvestClick = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };
    const [activeSecurityTab, setActiveSecurityTab] = useState('Data Encryption');

    const securityTabs = [
        { id: 'Data Encryption', title: 'Data Encryption', text: 'All sensitive data is encrypted and stored securely', desc: 'We implement the highest security standards to ensure your personal information and trading activities are safe.' },
        { id: 'Account Protection', title: 'Account Protection', text: 'Multi-factor authentication and advanced fraud detection', desc: 'Secure your wealth with industry-leading protection protocols.' },
        { id: 'Compliance', title: 'Compliance', text: 'Fully regulated and compliant with global standards', desc: 'We operate with transparency and adhere to all legal requirements.' },
        { id: 'Refer And Earn', title: 'Refer And Earn', text: 'Invite friends and get rewards for every successful referral', desc: 'Grow your portfolio by sharing the Investment Smart Crypto Investing experience with others.' },
    ];

    const activeTabContent = securityTabs.find(tab => tab.id === activeSecurityTab);

    // Load TradingView Widget
    React.useEffect(() => {
        const container = document.getElementById('tradingview-widget-container');

        if (container) {
            container.innerHTML = ''; // Clear any existing widget

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
    }, []);

    // Load TradingView Economic Calendar Widget
    React.useEffect(() => {
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
                "width": "500",
                "height": 550
            });

            container.appendChild(script);
        }
    }, []);

    // Load TradingView Hotlists Widget (Stock Market)
    React.useEffect(() => {
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
    }, []);

    // Load TradingView Market Overview Widget
    React.useEffect(() => {
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
    }, []);









    // Load TradingView Forex Cross Rates Widget
    React.useEffect(() => {
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
                "currencies": [
                    "EUR",
                    "USD",
                    "JPY",
                    "GBP",
                    "CHF",
                    "AUD",
                    "CAD",
                    "NZD",
                    "CNY"
                ],
                "backgroundColor": "#ffffff",
                "width": "100%",
                "height": 400
            });

            container.appendChild(script);
        }
    }, []);

    // Load TradingView Crypto Heatmap Widget
    React.useEffect(() => {
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
    }, []);



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="home-container"
        >
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    {/* Left Column - Welcome Text */}
                    <div className="hero-left">
                        <div className="brand-tag">
                            <span className="star-icon">✦</span>
                            <span className="brand-name">Investment Smart Crypto Investing</span>
                        </div>
                        <h1 className="hero-title">
                            Welcome to<br />
                            <span className="highlight">Investment Smart Crypto Investing</span>
                        </h1>
                        <p className="hero-subtitle">
                            Empower your financial future with our user-friendly stock trading platform.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/login" className="cta-btn primary">Login</Link>
                            <button className="cta-btn secondary" onClick={handleInvestClick}>Sign Up</button>
                        </div>
                    </div>

                    {/* Center Column - Hero Image */}
                    <div className="hero-center">
                        <div className="image-circle">
                            <div className="circle-bg"></div>
                            <img
                                src={heroImage}
                                alt="Woman using trading app"
                                className="hero-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="hero-right">
                        <div className="stats-block">
                            <h2 className="stats-number">
                                <CountUp end={50} suffix="k+" />
                            </h2>
                            <h3 className="stats-label">investors</h3>
                            <p className="stats-desc">
                                Whether you're a seasoned investor or just starting out,
                                we provide the tools, insights, and support you need.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="hero-decor">
                    <div className="plant-left"></div>
                    <div className="plant-right"></div>
                </div>
            </section>

            {/* TradingView Ticker Tape - Below Hero Section */}
            <div className="tradingview-widget-container" id="tradingview-widget-container">
                <div className="tradingview-widget-container__widget"></div>
            </div>

            {/* ETF Investment Section */}
            <section className="etf-section">
                <div className="etf-container">
                    {etfCategories.map((category, index) => (
                        <div key={index} className="etf-row">
                            {/* Left Side - Text */}
                            <div className="etf-category-content">
                                <h3 className="etf-title">{category.title}</h3>
                                <p className="etf-description">{category.description}</p>
                                <button className="invest-btn" onClick={handleInvestClick}>
                                    Invest <span className="arrow">→</span>
                                </button>
                            </div>

                            {/* Right Side - Panel or Widget */}
                            {index === 0 ? (
                                <div className="tradingview-widget-wrapper" style={{ flex: 1, width: '100%', minWidth: '0', display: 'block' }}>
                                    <div className="tradingview-widget-container" id="economic-calendar-widget" style={{ width: '100%', height: '100%' }}>
                                        <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                        <div className="tradingview-widget-copyright">
                                            <a href="https://www.tradingview.com/economic-calendar/" rel="noopener nofollow noreferrer" target="_blank">
                                                <span className="blue-text">Economic Calendar</span>
                                            </a>
                                            <span className="trademark"> by TradingView</span>
                                        </div>
                                    </div>
                                </div>
                            ) : index === 1 ? (
                                <div className="tradingview-widget-wrapper" style={{ flex: 1, width: '100%', minWidth: '0', display: 'block' }}>
                                    <div className="tradingview-widget-container" id="stock-market-widget" style={{ width: '100%', height: '100%' }}>
                                        <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                        <div className="tradingview-widget-copyright">
                                            <a href="https://www.tradingview.com/markets/stocks-usa/" rel="noopener nofollow noreferrer" target="_blank">
                                                <span className="blue-text">Stocks today</span>
                                            </a>
                                            <span className="trademark"> by TradingView</span>
                                        </div>
                                    </div>
                                </div>
                            ) : index === 2 ? (
                                <div className="tradingview-widget-wrapper" style={{ flex: 1, width: '100%', minWidth: '0', display: 'block' }}>
                                    <div className="tradingview-widget-container" id="market-overview-widget" style={{ width: '100%', height: '100%' }}>
                                        <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                        <div className="tradingview-widget-copyright">
                                            <a href="https://www.tradingview.com/markets/" rel="noopener nofollow noreferrer" target="_blank">
                                                <span className="blue-text">World markets</span>
                                            </a>
                                            <span className="trademark"> by TradingView</span>
                                        </div>
                                    </div>
                                </div>


                            ) : index === 3 ? (
                                <div className="tradingview-widget-wrapper" style={{ flex: 1, width: '100%', minWidth: '0', display: 'block' }}>
                                    <div className="tradingview-widget-container" id="forex-cross-rates-widget" style={{ width: '100%', height: '100%' }}>
                                        <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                                        <div className="tradingview-widget-copyright">
                                            <a href="https://www.tradingview.com/markets/currencies/" rel="noopener nofollow noreferrer" target="_blank">
                                                <span className="blue-text">Forex market</span>
                                            </a>
                                            <span className="trademark"> by TradingView</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="etf-stock-panel-wrapper">
                                    <div className="stock-panel">
                                        {/* Mini Chart */}
                                        <div className="mini-chart">
                                            <div className="chart-header">
                                                <span className="chart-label">Jul</span>
                                                <span className="chart-label">Aug</span>
                                                <span className="chart-label">Sep</span>
                                            </div>
                                            <svg className="chart-svg" viewBox="0 0 200 60" preserveAspectRatio="none">
                                                <path
                                                    d={index === 0
                                                        ? "M0,45 Q30,30 50,35 T100,25 T150,30 T200,20"
                                                        : index === 1
                                                            ? "M0,40 Q40,45 80,30 T120,35 T160,25 T200,30"
                                                            : "M0,50 Q50,35 100,40 T150,25 T200,15"
                                                    }
                                                    fill="none"
                                                    stroke="#4A9FD4"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    d={index === 0
                                                        ? "M0,45 Q30,30 50,35 T100,25 T150,30 T200,20 V60 H0 Z"
                                                        : index === 1
                                                            ? "M0,40 Q40,45 80,30 T120,35 T160,25 T200,30 V60 H0 Z"
                                                            : "M0,50 Q50,35 100,40 T150,25 T200,15 V60 H0 Z"
                                                    }
                                                    fill="url(#chartGradient)"
                                                    opacity="0.3"
                                                />
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#4A9FD4" />
                                                        <stop offset="100%" stopColor="transparent" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="chart-footer">
                                                <span>12</span>
                                                <span>19</span>
                                                <span>26</span>
                                                <span>07</span>
                                                <span>14</span>
                                            </div>
                                        </div>

                                        {/* Stock Listings */}
                                        <div className="stock-list">
                                            {stockListings[index] && stockListings[index].map((stock, sIndex) => (
                                                <div key={sIndex} className="stock-item">
                                                    <div className="stock-info">
                                                        <div
                                                            className="stock-logo"
                                                            style={{ backgroundColor: stock.color }}
                                                        >
                                                            {stock.symbol.charAt(0)}
                                                        </div>
                                                        <div className="stock-details">
                                                            <span className="stock-symbol">{stock.symbol}</span>
                                                            <span className="stock-name">{stock.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="stock-price-info">
                                                        <span className="stock-price">${stock.price}</span>
                                                        <span className={`stock-change ${stock.positive ? 'positive' : 'negative'}`}>
                                                            {stock.change}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}


                </div>
            </section>





            {/* Security Section */}
            <section className="security-priority-section">
                <div className="security-container">
                    <div className="security-header">
                        <div className="security-header-left">
                            <div className="section-tag">
                                <span className="star-icon">🛡️</span>
                                <span className="tag-text">Security</span>
                            </div>
                            <h2 className="security-title">Your Security, Our Priority</h2>
                        </div>
                        <div className="security-header-right">
                            <p className="security-intro">
                                {activeTabContent.desc}
                            </p>
                        </div>
                    </div>

                    <div className="security-tabs-control">
                        {securityTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`security-tab-btn ${activeSecurityTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveSecurityTab(tab.id)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    <div className="security-content-area">
                        <div className="security-card">
                            <h3 className="card-feature-title">{activeTabContent.title}:</h3>
                            <p className="card-feature-text">{activeTabContent.text}</p>
                            <Link to="/about" className="about-us-btn">
                                About Us <span className="arrow">→</span>
                            </Link>
                        </div>
                        <div className="security-visual">
                            <img src={boxImage} alt="Security Visual" className="security-img" />
                        </div>
                    </div>
                </div>
                {/* Crypto Heatmap Section */}
                <div className="crypto-heatmap-section" style={{ marginTop: '80px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div className="section-tag-pill">
                            <div className="dot-blue"></div>
                            <span className="tag-text">Market Overview</span>
                        </div>
                    </div>
                    <h2 className="features-heading" style={{ marginBottom: '40px', fontSize: '36px', color: '#1e3a5f' }}>
                        Real-Time Market Heatmap
                    </h2>

                    <div className="tradingview-widget-wrapper" style={{ width: '100%', height: '550px', display: 'block' }}>
                        <div className="tradingview-widget-container" id="crypto-heatmap-widget" style={{ width: '100%', height: '100%' }}>
                            <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                            <div className="tradingview-widget-copyright">
                                <a href="https://www.tradingview.com/heatmap/crypto/" rel="noopener nofollow noreferrer" target="_blank">
                                    <span className="blue-text">Crypto Heatmap</span>
                                </a>
                                <span className="trademark"> by TradingView</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Seamless Trading Section */}
            <section className="steps-section">
                <div className="steps-header">
                    <div className="header-left">
                        <div className="section-tag-pill">
                            <span className="dot-blue"></span>
                            <span className="tag-text">How To Get Started</span>
                        </div>
                        <h2 className="steps-heading">Seamless Trading in 3 Easy Steps</h2>
                    </div>
                    <div className="header-right">
                        <p className="steps-intro">Our account opening is easy and straight forward.</p>
                    </div>
                </div>

                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-visual-bg" style={{ backgroundImage: `url(${require('../assets/step-register.png')})` }}></div>
                        <div className="step-info-overlay">
                            <h3 className="step-card-title">Register</h3>
                            <p className="step-card-text">Sign up for a Investment Smart Crypto Investing Live Account with our hassle-free process.</p>
                        </div>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-visual-bg" style={{ backgroundImage: `url(${require('../assets/step-fund.png')})` }}></div>
                        <div className="step-info-overlay">
                            <h3 className="step-card-title">Fund</h3>
                            <p className="step-card-text">Effortlessly fund your account with a wide range of channels and accepted currencies.</p>
                        </div>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-visual-bg" style={{ backgroundImage: `url(${require('../assets/mee.jpg')})` }}></div>
                        <div className="step-info-overlay">
                            <h3 className="step-card-title">Start Trading</h3>
                            <p className="step-card-text">Access hundreds of instruments under market-leading trading conditions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-choose-us-section">
                <div className="why-us-container">
                    <div className="why-us-content">
                        <div className="section-tag">
                            <span className="star-icon">✦</span>
                            <span className="tag-text">Key Features</span>
                        </div>
                        <h2 className="why-us-title">Why Choose Us?</h2>

                        <div className="features-stack">
                            <div className="feature-item-card">
                                <div className="feature-icon-circle">
                                    <span className="icon">🛡️</span>
                                </div>
                                <div className="feature-details">
                                    <h3 className="feature-title">Advanced Trading Tools</h3>
                                    <p className="feature-desc">Utilize cutting-edge tools for in-depth market analysis.</p>
                                </div>
                            </div>

                            <div className="feature-item-card highlighted">
                                <div className="feature-icon-circle">
                                    <span className="icon">📈</span>
                                </div>
                                <div className="feature-details">
                                    <h3 className="feature-title">Diverse Investment Options</h3>
                                    <p className="feature-desc">From stocks and ETFs to options and futures, explore a wide range of investment opportunities.</p>
                                </div>
                            </div>

                            <div className="feature-item-card">
                                <div className="feature-icon-circle">
                                    <span className="icon">🎓</span>
                                </div>
                                <div className="feature-details">
                                    <h3 className="feature-title">Educational Resources</h3>
                                    <p className="feature-desc">Boost your trading knowledge with our comprehensive library of tutorials, webinars, and market analysis.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="why-us-visual">
                        <div className="visual-wrapper">
                            <img src={require('../assets/you.jpg')} alt="Trading Analysis" className="why-us-img" />
                        </div>
                    </div>
                </div>
            </section>
            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header-top">
                    <div className="header-left">
                        <div className="section-tag-pill">
                            <span className="dot-blue"></span>
                            <span className="tag-text">Testimonial</span>
                        </div>
                        <h2 className="testimonials-heading">Genuine reviews from satisfied customers</h2>
                    </div>
                    <div className="header-right">
                        <Link to="/contact" className="contact-now-btn">
                            Contact Now <span className="arrow">→</span>
                        </Link>
                    </div>
                </div>

                <div className="testimonial-content">
                    <div className="testimonial-quote-box">
                        <p className="quote-text">
                            "The best place for anything stock trading. They are the best and they offer only the best companies that would make you alot of money. Will recomment anytime, anywhere, anyday!"
                        </p>
                        <div className="testimonial-author">
                            <img src={avatar1} alt="John Benson" className="author-img" />
                            <div className="author-info">
                                <h4 className="author-name">John Benson</h4>
                                <p className="author-role">Investor</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-side-note">
                        <p>
                            Northoldings reported Assets Under Custody (AUC) is currently totaling $8.9 billion. With 64% of funded customer accounts owned by North American investors. This growth is attributed to continued net deposits and higher valuations in equity and cryptocurrency holding.
                        </p>
                        <div className="testimonial-nav">
                            <button className="nav-circle prev">←</button>
                            <button className="nav-circle next">→</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trade Assets CTA Banner */}
            <section className="trade-assets-cta">
                <div className="cta-banner-card">
                    <div className="cta-visual">
                        <img src={require('../assets/step-fund.png')} alt="Global Markets" className="cta-img" />
                    </div>
                    <div className="cta-content">
                        <div className="section-tag">
                            <span className="star-icon">✦</span>
                            <span className="tag-text">Get Started</span>
                        </div>
                        <h2 className="cta-title">Trade assets from global markets</h2>
                        <p className="cta-desc">Capitalize on every opportunity with the world's most popular assets.</p>
                        <div className="cta-actions">
                            <Link to="/login" className="cta-btn primary-bg">Login</Link>
                            <button className="cta-btn white-bg" onClick={handleInvestClick}>Register</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section className="faq-section">
                <div className="section-header-top">
                    <div className="header-left">
                        <div className="section-tag-pill">
                            <span className="dot-blue"></span>
                            <span className="tag-text">FAQs</span>
                        </div>
                        <h2 className="faq-heading">Frequently Asked Questions</h2>
                    </div>
                    <div className="header-right">
                        <Link to="/contact" className="contact-now-btn">
                            Contact Now <span className="arrow">→</span>
                        </Link>
                    </div>
                </div>

                <div className="faq-grid">
                    <div className="faq-item">
                        <div className="faq-icon-circle">?</div>
                        <div className="faq-details">
                            <h3 className="faq-question">How do I start trading?</h3>
                            <p className="faq-answer">Sign up for an account, fund it, and you're ready to start trading.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-icon-circle">?</div>
                        <div className="faq-details">
                            <h3 className="faq-question">What types of accounts do you offer?</h3>
                            <p className="faq-answer">We offer individual, joint, and retirement accounts to meet your specific needs.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-icon-circle">?</div>
                        <div className="faq-details">
                            <h3 className="faq-question">Is my money safe?</h3>
                            <p className="faq-answer">Yes, your funds are held in secure accounts, and we employ robust security measures to protect your investments.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-icon-circle">?</div>
                        <div className="faq-details">
                            <h3 className="faq-question">What are the most popular stocks to trade today?</h3>
                            <p className="faq-answer">The most popular to trade are typically those that have high liquidity, volatility, and trading volume. In stock trading, liquidity basically means the ease at which a stock can be bought or sold with minimal price movement.</p>
                        </div>
                    </div>
                </div>
            </section>
            <GlobalAvailabilityPopup />
        </motion.div >
    );
};

export default Home;
