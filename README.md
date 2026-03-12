# Iqra: Enterprise-Grade Trading & Investment Platform

## Executive Overview

**Iqra** is a full-featured, enterprise-grade trading and investment platform engineered for scale, security, and real-time performance. Built on a modern **React + Laravel** stack, it delivers a seamless user experience for stock trading, crypto investments, and portfolio management—all wrapped in a sleek, responsive interface.

### Why This Matters
- **Real-Time Trading**: Live balance updates via Laravel Echo & Pusher ensure users see instantaneous changes.
- **Bank-Grade Security**: Role-based access control (RBAC), KYC verification, and audit trails meet fintech compliance standards.
- **Scalable Architecture**: Decoupled frontend (React) and backend (Laravel API) enable independent scaling and seamless deployment.
- **Multi-Asset Support**: Unified dashboard for stocks, ETFs, and crypto with actionable insights.
- **Production-Ready**: Dockerized, environment-configurable, and deployed-ready (Vercel/Netlify/Fly.io).

---

## Key Features

### 🔐 Secure Authentication & Authorization
- **Laravel Sanctum** API tokens for stateless auth
- **Role-based middleware** (`admin` guard) for admin panel segregation
- **Throttled login** (5 attempts/min) to prevent brute force
- **Secure password reset** with hashed tokens and email verification

### 💳 Advanced Financial Operations
- **Stripe Integration** for instant deposits with Payment Intents
- **Atomic Transactions** using pessimistic locking (`lockForUpdate`) to prevent race conditions
- **Idempotent Payment Processing** via unique `transaction_reference` to avoid double-spending
- **Dual-Balance System**: `funding_balance` (cash) and `holding_balance` (invested assets)

### 📊 Real-Time Market Data
- **Live Stock Ticker** with CSS animations
- **Categorized Asset Lists**: General, Energy, Construction, Crypto Mining, Crypto Trading, Tech, Automotive, Agriculture
- **Dynamic Pricing**: Color-coded changes (green/red) with percentage movements
- **WebSocket-Ready**: Broadcast `BalanceUpdated` events to clients instantly

### 🛡️ Compliance & Security
- **KYC Workflow**: Document upload with statuses (pending/approved/rejected)
- **Withdrawal KYC Consumption**: One KYC approval per withdrawal (forces re-verification)
- **Security Headers Middleware**: HSTS, X-Frame-Options, CSP, X-Content-Type-Options
- **Audit Trails**: All financial transactions logged with `payment_gateway` and `transaction_reference`

### 🏛️ Admin Dashboard
- **User Management**: View, delete, and monitor all users
- **KYC Review Queue**: Pending-first sorting with approve/reject actions
- **Transaction Oversight**: Full history with status updates
- **Support Ticket System**: Full CRUD for user tickets with admin replies
- **Stock Management**: Seed and manage market data

### 📑 Support & Communication
- **Ticketing System**: Users submit, reply, and close tickets with file attachments
- **Email Notifications**: OTP emails for withdrawal verification (Gmail SMTP ready)
- **Professional Templates**: Responsive HTML email designs

---

## Target Users & Value Proposition

| User Type | Benefits |
|-----------|----------|
| **Retail Investors** | One-stop dashboard for stocks/crypto, real-time balances, easy deposits/withdrawals |
| **Active Traders** | Fast execution, atomic transfers, and transparent transaction history |
| **Financial Advisors** | Admin tools to manage client portfolios and withdrawal approvals |
| **Compliance Officers** | KYC review workflow, audit logs, and regulatory-grade security |
| **Platform Operators** | Dockerized deployment, scalable Laravel backend, React frontend for rapid iteration |

---

## Technical Architecture

### System Overview
```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    DB/Redis    ┌─────────────────┐
│   React SPA     │◄──────────────►│  Laravel API    │◄──────────────►│   MySQL/SQLite │
│ (Port 3000)     │                │ (Port 8000)     │                │   + Redis      │
└─────────────────┘                └─────────────────┘                └─────────────────┘
        │                                 │                                 │
        │ WebSocket (Pusher)              │ Broadcast Events                │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                                   ┌─────────────────┐
                                   │  Frontend UI    │
                                   │  Updates        │
                                   └─────────────────┘
```

### Frontend Stack
- **React 19** with functional components & hooks
- **React Router v7** for SPA navigation
- **Axios** for API calls
- **Tailwind CSS** + custom CSS for design system
- **Framer Motion** for smooth animations
- **Lightweight Charts** for financial visualizations
- **Laravel Echo** + **Pusher JS** for real-time balance updates

### Backend Stack
- **Laravel 10+** (PHP 8.2+)
- **Laravel Sanctum** for API authentication
- **Laravel Echo Server** (broadcasting)
- **MySQL/SQLite** (configurable) for relational data
- **Stripe PHP SDK** for payment processing
- **Intervention Image** (implied) for KYC document handling

### Database Schema Highlights
```sql
users (
  id, email, password, first_name, last_name,
  funding_balance DECIMAL(15,2) DEFAULT 0,
  holding_balance DECIMAL(15,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE
)

kyc_records (
  user_id, document_type, document_number,
  document_front_image_path, document_back_image_path,
  status ENUM('pending','approved','rejected','expired')
)

transactions (
  user_id, type ENUM('deposit','withdraw','transfer'),
  amount DECIMAL(15,2), from_account, to_account,
  status ENUM('pending','completed','rejected'),
  transaction_reference UNIQUE,
  payment_gateway ENUM('stripe','system','manual','crypto_gateway')
)

stocks (symbol, name, value, change, chgPct, category)
support_tickets (ticket_number, user_id, priority, status)
support_ticket_messages (support_ticket_id, user_id, message, attachments JSON)
```

### Security Patterns
1. **Pessimistic Locking**: `User::lockForUpdate()->find($id)` in `TransactionService` prevents concurrent balance modifications.
2. **Idempotency Checks**: `Transaction::where('transaction_reference', $ref)->exists()` blocks duplicate deposits.
3. **Role Checks**: `admin` middleware verifies `$request->user()->is_admin === true`.
4. **File Upload Validation**: KYC documents limited to 2MB with MIME type checks.
5. **CORS Configuration**: Sanctum stateful domains + credential support.

---

## Installation & Usage Guide

### Prerequisites
- **Node.js 20+** & npm/yarn
- **PHP 8.2+** with Composer
- **MySQL 8+** or SQLite (for dev)
- **Stripe Account** (for payments)
- **Pusher Account** (optional, for real-time)

### Environment Setup

#### 1. Clone & Install Dependencies
```bash
git clone <repository-url> iqra_website
cd iqra_website

# Frontend
cd frontend  # if separated; otherwise in root
npm install

# Backend
cd ../backend
composer install
php artisan key:generate
```

#### 2. Configure Environment Variables
Create `.env` in the `backend` directory:

```env
APP_NAME="Iqra"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_URL=http://localhost:8000

# Database (MySQL example)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iqra
DB_USERNAME=root
DB_PASSWORD=

# Sanctum (for SPA auth)
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1

# Stripe
STRIPE_SECRET=sk_test_your_stripe_secret
STRIPE_PUBLISHABLE=pk_test_your_stripe_publishable

# Mail (Gmail SMTP example)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@iqra.com
MAIL_FROM_NAME="Iqra Support"

# Broadcasting (Pusher)
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

#### 3. Database Migration & Seeding
```bash
php artisan migrate --seed
```
This creates tables and seeds:
- Admin user (`mandeepkumar.ltd@gmail.com` / `Nextstep@2766`)
- Sample stocks (TSLA, AAPL, BTC, etc.)
- Payment settings (bank/crypto addresses)

#### 4. Build Frontend
```bash
# From backend root (if React in /frontend)
cd ../frontend
npm run build
# Build output goes to /frontend/build
```

#### 5. Run Development Servers
```bash
# Backend (Laravel)
cd backend
php artisan serve --port=8000

# Frontend (React)
cd frontend
npm start
```
App accessible at: `http://localhost:3000`

---

## Docker Deployment (Production)

The included `Dockerfile` uses a multi-stage build:

```dockerfile
# Stage 1: Build React app
FROM node:20 as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build & run:
```bash
docker build -t iqra-platform .
docker run -p 8080:80 iqra-platform
```

---

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | User registration |
| POST | `/api/login` | Login (returns Sanctum token) |
| POST | `/api/logout` | Invalidate token (auth required) |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| POST | `/api/forgot-password` | Send reset link (logs token) |
| POST | `/api/reset-password` | Reset password with token |

### User Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get authenticated user + KYC status |
| POST | `/api/kyc/submit` | Submit KYC documents |
| GET | `/api/kyc/status` | Get KYC status |
| GET | `/api/stocks` | List all stocks (public to authenticated) |
| POST | `/api/transfer` | Transfer between funding/holding |
| GET | `/api/transactions` | User transaction history |
| POST | `/api/deposit-request` | Initiate deposit (manual/crypto) |
| POST | `/api/withdraw` | Request withdrawal (consumes KYC) |

### Payment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-intent` | Create Stripe PaymentIntent |
| POST | `/api/payment/confirm` | Confirm Stripe payment & credit balance |

### Admin Endpoints (Admin Middleware)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/me` | Current admin user |
| GET | `/api/admin/users` | List all users with KYC |
| GET | `/api/admin/kyc-pending` | KYC submissions (pending first) |
| POST | `/api/admin/kyc-update/{id}` | Approve/reject KYC |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/transactions` | All transactions |
| POST | `/api/admin/transaction-update/{id}` | Complete/reject transaction |
| GET | `/api/admin/payment-settings` | Get bank/crypto settings |
| POST | `/api/admin/transfer` | Admin-initiated balance transfer (any user) |
| GET | `/api/admin/stocks` | List stocks (admin view) |

### Support Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/tickets` | User's tickets |
| POST | `/api/support/tickets` | Create ticket (with attachments) |
| GET | `/api/support/tickets/{id}` | View ticket details |
| POST | `/api/support/tickets/{id}/reply` | User reply |
| POST | `/api/support/tickets/{id}/close` | Close ticket |
| GET | `/api/admin/support/tickets` | Admin: all tickets |
| POST | `/api/admin/support/tickets/{id}/reply` | Admin reply |
| POST | `/api/admin/support/tickets/{id}/close` | Admin close |

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/up` | Laravel health check |

---

## Usage Examples

### 1. User Registration & Deposit
```javascript
// Register
const register = async (data) => {
  const res = await axios.post('/api/register', {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'secret',
    password_confirmation: 'secret'
  });
  return res.data.user;
};

// Login
const login = async (email, password) => {
  const res = await axios.post('/api/login', { email, password });
  localStorage.setItem('token', res.data.token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
};

// Create Stripe Payment Intent
const createDeposit = async (amount) => {
  const res = await axios.post('/api/payment/create-intent', { amount, currency: 'usd' });
  const { clientSecret } = res.data;
  // Use Stripe.js to confirm payment, then call /api/payment/confirm
};
```

### 2. Real-Time Balance Updates
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
window Echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.REACT_APP_PUSHER_KEY,
  cluster: process.env.REACT_APP_PUSHER_CLUSTER,
  encrypted: true,
});

// Listen for balance updates
Echo.private(`App.Models.User.${userId}`)
  .listen('.balance.updated', (e) => {
    console.log('Balance changed:', e.funding_balance, e.holding_balance);
    // Update React state/context
  });
```

### 3. Admin: Approve KYC & Transaction
```bash
# Approve KYC
curl -X POST http://localhost:8000/api/admin/kyc-update/5 \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'

# Complete Deposit Transaction
curl -X POST http://localhost:8000/api/admin/transaction-update/123 \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"status":"completed"}'
```

### 4. Withdrawal Flow (Consumes KYC)
```javascript
// User requests withdrawal
const withdraw = async (amount, method, details) => {
  const res = await axios.post('/api/withdraw', {
    amount,
    method, // 'bank' or 'crypto'
    details: { bank_account: '...', swift: '...' } // or crypto wallet
  });
  // Response includes transaction and new balance
  // KYC status is reset to 'expired'
};
```

---

## Future Potential & Roadmap

### Q2 2026
- **WebSocket Live Prices**: Push real-time stock/crypto prices to UI
- **Two-Factor Authentication (2FA)**: TOTP via Google Authenticator
- **Advanced Charting**:integration with TradingView widgets
- **Multi-Currency Support**: Auto-conversion for deposits/withdrawals

### Q3 2026
- **Mobile App**: React Native wrapper using the same API
- **Webhook Integrations**: Stripe, SendGrid, and Pusher webhooks for async reliability
- **Rate Limiting**: Per-endpoint throttling beyond login
- **Audit Log**: Detailed admin action logging

### Q4 2026
- **White-Label API**: Multi-tenancy for affiliate programs
- **AI-Powered Insights**: Portfolio recommendations using ML
- **Blockchain Settlements**: Direct crypto withdrawals via Node.js microservice
- **Regulatory Reporting**: Automated CSV/PDF generation for tax purposes

---

## Contributing

We welcome contributions from the community! Please follow these guidelines:

1. **Fork & Branch**: Create a feature branch from `main`.
2. **Coding Standards**: Follow PSR-12 (PHP) and Airbnb (JS) styleguides.
3. **Tests**: Add PHPUnit tests for backend, Jest for frontend.
4. **Commit messages**: Use conventional commits (`feat:`, `fix:`, `docs:`).
5. **Pull Request**: Open a PR with a clear description and linked issue.

```bash
# Setup for contribution
git clone <repo>
cd iqra_website
composer install
npm ci
cp .env.example .env
# Configure .env as above
php artisan migrate --seed
npm start
```

---

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

> **Note**: This is a proprietary financial platform template. Do not use in production without:
> - Full security audit
> - PCI-DSS compliance for card data
> - Legal consultation for KYC/AML regulations
> - Stripe & Pusher production accounts with proper webhook endpoints

---

## Deployment Quick Start

### Vercel (Frontend)
```bash
vercel --prod
```
Set environment variables in Vercel dashboard:
- `REACT_APP_API_URL=https://your-backend.com`
- `REACT_APP_PUSHER_KEY`, `REACT_APP_PUSHER_CLUSTER`

### Heroku (Backend)
```bash
heroku create iqra-backend
heroku addons:create jawsdb:kitefin  # MySQL
heroku config:set APP_KEY=$(php artisan key:generate --show)
heroku config:set STRIPE_SECRET=sk_live_...
heroku config:set SANCTUM_STATEFUL_DOMAINS=yourfrontend.com
heroku config:set APP_URL=https://iqra-backend.herokuapp.com
git push heroku main
php artisan migrate --force
```

### Docker Compose (Full Stack)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on: [mysql, redis]
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
  mysql:
    image: mysql:8
    environment:
      - MYSQL_DATABASE=iqra
      - MYSQL_ROOT_PASSWORD=secret
    volumes: ["mysql_data:/var/lib/mysql"]
  redis:
    image: redis:alpine
volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

---

**Built with ❤️ for traders, by traders.  
Iqra – Where Intelligence Meets Investment.**