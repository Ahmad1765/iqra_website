import React, { useState, useEffect } from 'react';
import './ManageReferrals.css';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

const ManageReferrals = () => {
    const [referralLink, setReferralLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user');
                // Assuming the username is used for the referral reference
                if (response.data && response.data.name) {
                    // Clean name for URL if needed, or use ID. Using name as per screenshot example 'Nothingatall'
                    const refCode = response.data.name.replace(/\s+/g, '');
                    setReferralLink(`https://investment-smart-crypto.com?reference=${refCode}`);
                }
            } catch (error) {
                console.error("Failed to fetch user for referral link", error);
            }
        };
        fetchUser();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout activePage="referrals">
            <div className="manage-referrals-container">
                <div className="referral-card">
                    <h3>Referral Link</h3>
                    <div className="referral-input-group">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="referral-input"
                        />
                        <button
                            className="copy-btn"
                            onClick={copyToClipboard}
                            title="Copy to clipboard"
                        >
                            {copied ? '✔' : '📋'}
                        </button>
                    </div>
                    {copied && <span className="copy-success-msg">Copied!</span>}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageReferrals;
