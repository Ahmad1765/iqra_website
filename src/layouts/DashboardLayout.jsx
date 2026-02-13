import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/Dashboard.css"; // Use existing dashboard styles
import logo from "../assets/new_logo.png";

const DashboardLayout = ({ children, activePage }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Use context instead of local fetch
  const [expandedMenu, setExpandedMenu] = useState(() => {
    if (activePage?.includes("deposit")) return "deposit";
    if (activePage?.includes("withdraw")) return "withdraw";
    if (activePage?.includes("support")) return "support";
    return "";
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("userParams_profileImage") || null,
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem("userParams_profileImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar code remains same until Bottom Nav */}
      <aside className="dashboard-sidebar">
        <div className="logo-container">
          <img
            src={logo}
            alt="Investment Smart Crypto Investing Logo"
            style={{ width: "auto", height: "40px", objectFit: "contain" }}
          />
          <span>Investment Smart Crypto Investing</span>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "dashboard" ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              Dashboard
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "stocks" ? "active" : ""}`}
              onClick={() => navigate("/stocks")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              All Stocks
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "assets" ? "active" : ""}`}
              onClick={() => navigate("/assets")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
              </span>
              Manage Assets
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "transfer" ? "active" : ""}`}
              onClick={() => navigate("/transfer")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </span>
              Transfer Balance
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage?.includes("deposit") ? "active" : ""}`}
              onClick={() =>
                setExpandedMenu(expandedMenu === "deposit" ? "" : "deposit")
              }
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="sidebar-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="1"
                      y="4"
                      width="22"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                    <line x1="12" y1="15" x2="12" y2="15"></line>
                  </svg>
                </span>
                <span>Manage Deposit</span>
              </div>
              <span style={{ fontSize: "0.8rem" }}>
                {expandedMenu === "deposit" ? "▼" : "▶"}
              </span>
            </div>
            {expandedMenu === "deposit" && (
              <ul className="sidebar-submenu">
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "deposit-new" ? "active" : ""}`}
                    onClick={() => navigate("/deposit/new")}
                  >
                    New Deposit
                  </div>
                </li>
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "deposit-history" ? "active" : ""}`}
                    onClick={() => navigate("/deposit/history")}
                  >
                    Deposit History
                  </div>
                </li>
              </ul>
            )}
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage?.includes("withdraw") ? "active" : ""}`}
              onClick={() =>
                setExpandedMenu(expandedMenu === "withdraw" ? "" : "withdraw")
              }
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="sidebar-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </span>
                <span>Manage Withdraw</span>
              </div>
              <span style={{ fontSize: "0.8rem" }}>
                {expandedMenu === "withdraw" ? "▼" : "▶"}
              </span>
            </div>
            {expandedMenu === "withdraw" && (
              <ul className="sidebar-submenu">
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "withdraw-new" ? "active" : ""}`}
                    onClick={() => navigate("/withdraw/new")}
                  >
                    Draw Now
                  </div>
                </li>
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "withdraw-history" ? "active" : ""}`}
                    onClick={() => navigate("/withdraw/history")}
                  >
                    Withdraw History
                  </div>
                </li>
              </ul>
            )}
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "transactions" ? "active" : ""}`}
              onClick={() => navigate("/transactions")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              Transaction History
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage?.includes("support") ? "active" : ""}`}
              onClick={() =>
                setExpandedMenu(expandedMenu === "support" ? "" : "support")
              }
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="sidebar-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </span>
                <span>Support Ticket</span>
              </div>
              <span style={{ fontSize: "0.8rem" }}>
                {expandedMenu === "support" ? "▼" : "▶"}
              </span>
            </div>
            {expandedMenu === "support" && (
              <ul className="sidebar-submenu">
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "support-new" ? "active" : ""}`}
                    onClick={() => navigate("/support/new")}
                  >
                    New Ticket
                  </div>
                </li>
                <li>
                  <div
                    className={`sidebar-link sub-link ${activePage === "support-history" ? "active" : ""}`}
                    onClick={() => navigate("/support/history")}
                  >
                    My Ticket
                  </div>
                </li>
              </ul>
            )}
          </li>
          <li className="sidebar-item">
            <div
              className={`sidebar-link ${activePage === "referrals" ? "active" : ""}`}
              onClick={() => navigate("/referrals")}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              Manage Referrals
            </div>
          </li>
          <li className="sidebar-item">
            <div
              className="sidebar-link"
              onClick={handleLogout}
              style={{ color: "#ef4444" }}
            >
              <span className="sidebar-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              Log Out
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          {/* Left Side: Chart/Graph Toggle */}
          <div className="header-left">
            <button className="header-icon-btn" title="Market Overview">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </button>
          </div>

          {/* Right Side: User Profile */}
          <div className="header-right" style={{ position: "relative" }}>
            <div
              className="user-profile"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <div className="user-info">
                <span className="user-name">{user?.name || "User"}</span>
                <span
                  className="user-role"
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  {user?.is_admin ? "Admin" : "Trader"}
                </span>
              </div>
              <div className="user-avatar-container">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="avatar-edit-overlay">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
              </div>
              <div style={{ marginLeft: "4px", color: "#cbd5e1" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-name">{user?.name}</div>
                  <div className="dropdown-user-email">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item file-input-wrapper">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden-file-input"
                  />
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/assets")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>
                    Balance: $
                    {parseFloat(user?.funding_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Log Out</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="dashboard-content">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="bottom-nav">
        <div
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <div className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${activePage === "stocks" ? "active" : ""}`}
          onClick={() => navigate("/stocks")}
        >
          <div className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <span>Stocks</span>
        </div>
        <div
          className={`nav-item ${activePage === "transfer" ? "active" : ""}`}
          onClick={() => navigate("/transfer")}
        >
          <div className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </div>
          <span>Transfer</span>
        </div>
        <div
          className={`nav-item ${activePage?.includes("deposit") ? "active" : ""}`}
          onClick={() => navigate("/deposit/new")}
        >
          <div className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span>Deposit</span>
        </div>
        <div
          className={`nav-item ${activePage?.includes("withdraw") ? "active" : ""}`}
          onClick={() => navigate("/withdraw/new")}
        >
          <div className="nav-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span>Withdraw</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
