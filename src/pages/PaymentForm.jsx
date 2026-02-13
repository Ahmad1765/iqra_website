import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import api from '../services/api';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

const stripePublishableKey =
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_TYooMQauvdEDq54NiTphI7jx';

const stripePromise = loadStripe(stripePublishableKey).catch(err => {
    console.warn("Stripe failed to load:", err);
    return null;
});

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState(10);
    const [currency, setCurrency] = useState('usd');
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null); // eslint-disable-line no-unused-vars
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);

        try {
            const { data } = await api.post('/payment/create-intent', {
                amount: amount,
                currency: currency
            });

            const clientSecret = data.clientSecret;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: 'Verified User',
                    },
                }
            });

            if (result.error) {
                setError(`Payment failed: ${result.error.message}`);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    try {
                        await api.post('/payment/confirm', {
                            payment_intent_id: result.paymentIntent.id,
                        });
                        setSucceeded(true);
                        setError(null);
                    } catch (confirmErr) {
                        setError('Payment succeeded but balance update failed.');
                    } finally {
                        setProcessing(false);
                    }
                } else {
                    setError('Payment was not completed.');
                    setProcessing(false);
                }
            }
        } catch (err) {
            setError('Payment initialization failed.');
            setProcessing(false);
        }
    };

    if (succeeded) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                <h2 style={{ color: '#10b981' }}>Payment Successful!</h2>
                <p>Thank you for your deposit.</p>
            </div>
        );
    }

    const inputStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
                iconColor: '#424770',
            },
            invalid: { color: '#9e2146' },
        },
    };

    const containerStyle = {
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white inside inputs
        marginBottom: '1rem'
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Amount Field */}
            <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Amount (USD)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    required
                    style={{
                        padding: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        background: 'rgba(255,255,255,0.9)'
                    }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b', textTransform: 'uppercase', fontSize: '0.8rem', textAlign: 'center' }}>Card Details</label>

                {/* Row 1: Card Number */}
                <div style={containerStyle}>
                    <CardNumberElement options={{ ...inputStyle, showIcon: true }} />
                </div>

                {/* Row 2: Expiry & CVC */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ ...containerStyle, flex: 1, marginBottom: 0 }}>
                        <CardExpiryElement options={inputStyle} />
                    </div>
                    <div style={{ ...containerStyle, flex: 1, marginBottom: 0 }}>
                        <CardCvcElement options={inputStyle} />
                    </div>
                </div>
            </div>

            {error && <div className="error-message" style={{ color: '#ef4444', marginTop: '10px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="auth-submit-btn"
                style={{
                    marginTop: '20px',
                    width: '100%',
                    background: '#0ea5e9',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)'
                }}
            >
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

const PaymentForm = ({ isEmbedded = false }) => {
    const navigate = useNavigate();

    // If embedded, return nicely styled glass container without full page layout
    if (isEmbedded) {
        return (
            <div style={{
                background: 'rgba(59, 130, 246, 0.08)', // Blueish glassy
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                maxWidth: '500px',
                margin: '2rem auto'
            }}>
                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            </div>
        );
    }

    return (
        <div className="auth-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-container" style={{ maxWidth: '500px' }}>
                <div className="auth-card">
                    <div className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Fund Account</h1>
                            <p>Secure payment via Stripe</p>
                        </div>
                        <button
                            type="button"
                            className="auth-submit-btn"
                            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                            onClick={() => navigate('/deposit-history')}
                        >
                            View History
                        </button>
                    </div>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;
