import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DepositHistory from './DepositHistory';
import PaymentForm from './PaymentForm'; // Reusing existing stripe form logic
import api from '../services/api';
import './ManageDeposit.css';

const ManageDeposit = ({ defaultTab = 'new' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(defaultTab); // 'new' or 'history'
    const [selectedMethod, setSelectedMethod] = useState('card'); // 'bank', 'crypto', 'card'
    const [showCryptoForm, setShowCryptoForm] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);

    // New state for crypto payment details
    const [paymentDetails, setPaymentDetails] = useState(null);

    // Crypto State
    const [cryptoAmount, setCryptoAmount] = useState('');
    const conversionRate = 0.00001; // Mock rate

    // Update state if prop changes (e.g. navigation via sidebar)
    React.useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    // Accordion handler
    const toggleMethod = (method) => {
        if (selectedMethod !== method) {
            setShowCryptoForm(false);
            setShowBankDetails(false); // Reset bank step on change
            setPaymentDetails(null); // Reset payment details
        }
        setSelectedMethod(selectedMethod === method ? null : method);
    };

    const handleCryptoDeposit = async () => {
        if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        try {
            const response = await api.post('/deposit-request', {
                amount: cryptoAmount,
                method: 'crypto'
            });

            // Set details to show the payment screen
            setPaymentDetails({
                ...response.data.crypto_details,
                transaction: response.data.transaction
            });
            setShowCryptoForm(false); // Hide input form

        } catch (error) {
            console.error('Deposit Error:', error);
            alert('Failed to submit deposit request. ' + (error.response?.data?.message || ''));
        }
    };

    // Determine sidebar active state based on tab
    const activeSidebarPage = activeTab === 'new' ? 'deposit-new' : 'deposit-history';

    return (
        <DashboardLayout activePage={activeSidebarPage}>
            <div className="manage-deposit-container">
                {/* Tabs */}
                <div className="deposit-tabs-header">
                    <button
                        className={`deposit-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        New Deposit
                    </button>
                    <button
                        className={`deposit-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Deposit History
                    </button>
                </div>

                {/* Content Area */}
                <div className="deposit-content-area">
                    {activeTab === 'new' ? (
                        <div className="new-deposit-wrapper">
                            <div className="deposit-back-actions">
                                <button className="back-dash-btn" onClick={() => navigate('/dashboard')}>
                                    Back to Dashboard
                                </button>
                            </div>

                            {/* Card Icons Row */}
                            {/* Professional Card Visuals Row */}
                            <div className="card-icons-row">


                                {/* Visa */}
                                <div className="credit-card-visual visa-card">
                                    <div className="card-top">
                                        <div className="card-logo-box">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="card-brand-logo" style={{ height: '30px' }} />
                                        </div>
                                    </div>
                                    <div className="card-number-display">**** **** **** 0000</div>
                                    <div className="card-bottom">
                                        <div className="card-info-group left">
                                            <span className="card-label">Expiry date: 00/00</span>
                                        </div>
                                        <div className="card-info-group right">
                                            <span className="card-label">Name: Your Name</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mastercard */}
                                <div className="credit-card-visual mastercard-card">
                                    <div className="card-top">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="card-brand-logo" />
                                    </div>
                                    <div className="card-number-display">**** **** **** 0000</div>
                                    <div className="card-bottom">
                                        <div className="card-info-group left">
                                            <span className="card-label">Expiry date: 00/00</span>
                                        </div>
                                        <div className="card-info-group right">
                                            <span className="card-label">Name: Your Name</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Discover */}
                                <div className="credit-card-visual discover-card">
                                    <div className="card-top">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Discover_Card_logo.svg/2560px-Discover_Card_logo.svg.png" alt="Discover" className="card-brand-logo" style={{ height: '25px' }} />
                                    </div>
                                    <div className="card-number-display">**** **** **** 0000</div>
                                    <div className="card-bottom">
                                        <div className="card-info-group left">
                                            <span className="card-label">Expiry date: 00/00</span>
                                        </div>
                                        <div className="card-info-group right">
                                            <span className="card-label">Name: Your Name</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-methods-accordion">
                                <div className="pm-header-label">Payment method</div>

                                {/* Bank Transfer */}
                                <div className={`pm-item ${selectedMethod === 'bank' ? 'active' : ''}`}>
                                    <div className="pm-title" onClick={() => toggleMethod('bank')}>
                                        <span>Bank Transfer</span>
                                        <span className="pm-icon">🏛️</span>
                                    </div>
                                    {selectedMethod === 'bank' && (
                                        <div className="pm-content">
                                            {!showBankDetails ? (
                                                <div className="bank-step-1">
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Details</h3>
                                                    <p style={{ marginBottom: '0.5rem', color: '#475569' }}><strong>Product:</strong> Fund Account</p>
                                                    <p style={{ marginBottom: '1.5rem', color: '#64748b', lineHeight: '1.6' }}>
                                                        All deposits done using this channel will be processed by Your Bank. Your account will automatically be funded as soon as the payment is confirmed. Thank you for choosing Investment Smart Crypto Investing.
                                                    </p>
                                                    <button
                                                        onClick={() => setShowBankDetails(true)}
                                                        style={{
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '10px 20px',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.2rem' }}>🏛️</span> Proceed via Bank Transfer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bank-details-step-2" style={{ textAlign: 'center', padding: '2rem' }}>
                                                    {/* Coming Soon Ribbon/Badge */}
                                                    <div style={{ display: 'inline-block', backgroundColor: '#ff4500', color: 'white', padding: '5px 20px', fontWeight: 'bold', fontSize: '1.2rem', transform: 'rotate(-5deg)', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                                        COMING SOON!
                                                    </div>
                                                    <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>Payment Method coming soon!</h3>
                                                    <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                                                        Kindly proceed via Cryptocurrency and select your desired coin for payment.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            toggleMethod('crypto');
                                                            setShowCryptoForm(true); // Open crypto form directly
                                                        }}
                                                        style={{
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '10px 20px',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.2rem' }}>₿</span> Proceed via Crypto
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Cryptocurrency */}
                                <div className={`pm-item ${selectedMethod === 'crypto' ? 'active' : ''}`}>
                                    <div className="pm-title" onClick={() => toggleMethod('crypto')}>
                                        <span>Cryptocurrency</span>
                                        <span className="pm-icon">₿</span>
                                    </div>
                                    {selectedMethod === 'crypto' && (
                                        <div className="pm-content">
                                            {paymentDetails ? (
                                                <div className="crypto-payment-screen" style={{ background: '#0f172a', padding: '2rem', borderRadius: '8px', color: 'white', border: '1px solid #1e293b' }}>
                                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                                        <h3 style={{ color: '#3b82f6', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Deposit Initiated</h3>
                                                        <p style={{ color: '#94a3b8' }}>Transaction Ref: <span style={{ fontFamily: 'monospace', color: 'white' }}>{paymentDetails.transaction.transaction_reference}</span></p>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                                        {/* BTC Section */}
                                                        <div className="crypto-wallet-box" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>₿</span>
                                                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Bitcoin (BTC)</span>
                                                            </div>
                                                            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', width: '150px', height: '150px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {/* Placeholder QR */}
                                                                <div style={{ width: '100%', height: '100%', background: 'black', opacity: '0.1' }}></div>
                                                                <span style={{ position: 'absolute', color: 'black', fontWeight: 'bold' }}>QR CODE</span>
                                                            </div>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Wallet Address</label>
                                                            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span>{paymentDetails.btc_address}</span>
                                                                <button onClick={() => { navigator.clipboard.writeText(paymentDetails.btc_address); alert('Copied!'); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>📋</button>
                                                            </div>
                                                        </div>

                                                        {/* ETH Section */}
                                                        <div className="crypto-wallet-box" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🔷</span>
                                                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Ethereum (ETH)</span>
                                                            </div>
                                                            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', width: '150px', height: '150px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {/* Placeholder QR */}
                                                                <div style={{ width: '100%', height: '100%', background: 'black', opacity: '0.1' }}></div>
                                                                <span style={{ position: 'absolute', color: 'black', fontWeight: 'bold' }}>QR CODE</span>
                                                            </div>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Wallet Address</label>
                                                            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span>{paymentDetails.eth_address}</span>
                                                                <button onClick={() => { navigator.clipboard.writeText(paymentDetails.eth_address); alert('Copied!'); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>📋</button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                                        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                            ⚠️ Please send only BTC to the BTC address and ETH to the ETH address. Sending other coins may result in permanent loss.
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                setPaymentDetails(null);
                                                                setActiveTab('history');
                                                                setCryptoAmount('');
                                                            }}
                                                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                                                        >
                                                            I Have Made Payment
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : !showCryptoForm ? (
                                                <div className="crypto-step-1">
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Details</h3>
                                                    <p style={{ marginBottom: '0.5rem', color: '#475569' }}><strong>Product:</strong> Fund Account</p>
                                                    <p style={{ marginBottom: '1.5rem', color: '#64748b', lineHeight: '1.6' }}>
                                                        All deposits done using this channel will be processed by your Wallet/Exchange. Your account will automatically be funded as soon as the payment is confirmed on the Blockchain. Thank you for choosing Investment Smart Crypto Investing.
                                                    </p>
                                                    <button
                                                        onClick={() => setShowCryptoForm(true)}
                                                        style={{
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '10px 20px',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.2rem' }}>₿</span> Proceed via Crypto
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="crypto-design-container" style={{ padding: '0', background: 'transparent' }}>
                                                    {/* Design matching the screenshot: Dark Card with Blue Header */}
                                                    <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', padding: '1rem' }}>
                                                        {/* Header */}
                                                        <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderRadius: '4px 4px 0 0', marginBottom: '1rem' }}>
                                                            Deposit
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                            {/* Left Column: Method Selection */}
                                                            <div style={{ flex: '1', minWidth: '250px', backgroundColor: 'white', borderRadius: '4px', padding: '1rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                                                    <input type="radio" checked readOnly style={{ marginRight: '10px', cursor: 'pointer' }} />
                                                                    <span style={{ fontWeight: '500' }}>Bitcoin</span>
                                                                    <span style={{ marginLeft: 'auto', color: '#64748b' }}>BTC</span>
                                                                </div>
                                                                {/* Add more coins here later if needed */}
                                                                <div style={{ marginTop: 'auto', height: '100px' }}></div> {/* Spacer to match height */}
                                                            </div>
                                                            {/* Right Column: Amount & Details */}
                                                            <div style={{ flex: '1', minWidth: '250px', backgroundColor: 'white', borderRadius: '4px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                {/* Amount Input */}
                                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                    <span style={{ padding: '0 1rem', color: '#64748b' }}>Amount</span>
                                                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                                                        <span style={{ padding: '0 0.5rem', color: '#64748b' }}>$</span>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="00.00"
                                                                            value={cryptoAmount}
                                                                            onChange={(e) => setCryptoAmount(e.target.value)}
                                                                            style={{ border: 'none', padding: '0.5rem', outline: 'none', width: '80px', textAlign: 'right' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Details List */}
                                                                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>Limit</span>
                                                                        <span>$10.00 USD - $100,000,000.00 USD</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>Processing Charge ⓘ</span>
                                                                        <span>0.00 USD</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                                                                        <span>Total</span>
                                                                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                                                                            {(parseFloat(cryptoAmount) || 0).toFixed(2)} USD
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>Conversion</span>
                                                                        <span>1 USD = {conversionRate} BTC</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                                        <span>In ₿</span>
                                                                        <span>{(parseFloat(cryptoAmount || 0) * conversionRate).toFixed(6)}</span>
                                                                    </div>
                                                                </div>
                                                                {/* Confirm Button */}
                                                                <button
                                                                    onClick={handleCryptoDeposit}
                                                                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
                                                                >
                                                                    Deposit Confirm
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                                                            Ensuring your funds grow safely through our secure deposit process with world-class payment options.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Credit Card */}
                                <div className={`pm-item ${selectedMethod === 'card' ? 'active' : ''}`}>
                                    <div className="pm-title" onClick={() => toggleMethod('card')}>
                                        <span>Credit Card</span>
                                        <div className="card-logos-small">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1205px-American_Express_logo_%282018%29.svg.png" height="20" alt="Amex" style={{ marginRight: '5px' }} />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" height="20" alt="Mastercard" style={{ marginRight: '5px' }} />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Discover_Card_logo.svg/2560px-Discover_Card_logo.svg.png" height="20" alt="Discover" />
                                        </div>
                                    </div>
                                    {selectedMethod === 'card' && (
                                        <div className="pm-content card-form-content">
                                            <div className="card-payment-split-layout">
                                                {/* Left Side: Info */}
                                                <div className="payment-info-side">
                                                    <h3 className="pay-det-title">Payment Details</h3>
                                                    <p className="pay-det-prod">Product: Fund Account</p>
                                                    <p className="ssl-note">
                                                        All Card information and payment processing are secured with <strong>SSL Secure Payment</strong>.
                                                        Your encryption is protected by 256-bit SSL encryption.
                                                    </p>
                                                    <p className="terms-note">
                                                        By proceeding with this payment option, you agree with our <button className="link-btn" onClick={() => navigate('/terms')}>Terms of Service</button> and confirm that you have read our <button className="link-btn" onClick={() => navigate('/privacy')}>Privacy Policy</button>. You can cancel payment at any time.
                                                    </p>
                                                </div>

                                                {/* Right Side: Form */}
                                                <div className="payment-form-side">
                                                    <div className="embedded-stripe-form">
                                                        <PaymentForm isEmbedded={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="history-tab-wrapper">
                            {/* Reusing DepositHistory Component without Full Page Wrapper */}
                            <DepositHistory isEmbedded={true} />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageDeposit;
