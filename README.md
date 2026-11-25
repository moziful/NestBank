# NestBank — Digital Banking Management System

**NestBank** is a multi-role digital banking and financial operations portal built with **Next.js 16 (App Router / Turbopack)**, **React 19**, **Tailwind CSS v4**, and **MongoDB**. It provides role-isolated workspaces for **Administrators**, **Bank Staff**, and **Customers**, featuring double-entry ledger accounting, PIN-authorized transfers, KYC customer onboarding, loan servicing, audit logging, and real-time notifications.

---

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, Turbopack, Partial Prerendering)
- **UI & Styling:** React `19.3.0`, Tailwind CSS v4, `react-icons/fi`, `next-themes`
- **Database:** MongoDB (`nestbank` database)
- **Security & Auth:** JWT (`nestbank_session` HTTP-only cookie), `bcryptjs` password & PIN hashing, AES-256-GCM + HMAC-SHA256 for identity document protection, role-based middleware & API guards

---

## Example Login Credentials

Login at [`/login`](http://localhost:3000/login). Users are automatically routed to their role-specific workspace upon sign-in.

| Role | Username | Email | Password | Transaction PIN | Default Workspace |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@nestbank.com` | `AdminPass123!` | — | `/admin/overview` |
| **Bank Staff** | `staff` | `staff@nestbank.com` | `StaffPass123!` | — | `/staff/overview` |
| **Customer** | `alice` | `alice@example.com` | `CustPass123!` | `1234` | `/customer` |
| **Customer** | `bob` | `bob@example.com` | `CustPass123!` | `1234` | `/customer` |
| **Customer** | `charlie` | `charlie@example.com` | `CustPass123!` | `1234` | `/customer` |

---

## Role Portals & Modules

### 1. Administrator (`/admin/*`)
- **Overview** (`/admin/overview`): Bank-wide liquidity, account distribution, transaction trends, and operational alerts.
- **Staff Management** (`/admin/staff-management`): Provision, activate/suspend, and reset credentials for Bank Staff.
- **Customer Management** (`/admin/customers`, `/admin/customers/[id]`): Search, inspect profiles, block/unblock access.
- **Bank Accounts** (`/admin/bank-accounts`, `/admin/bank-accounts/[id]`): Open accounts, manage limits, freeze/unfreeze accounts.
- **Transactions** (`/admin/transactions`): Central transaction monitoring, analytics, CSV export, suspicious activity flagging, and investigation notes.
- **Approvals** (`/admin/approvals`): Review and approve/reject pending deposit, withdrawal, and loan applications.
- **Loan Management** (`/admin/loans`, `/admin/loans/[id]`): Portfolio KPIs, atomic loan disbursement, reducing-balance repayment schedules, and payment history.
- **Audit Logs** (`/admin/audit-logs`): Append-only security & administrative activity trail with CSV export and sensitive data redaction.
- **Banking Settings** (`/admin/settings`): Versioned bank-wide limits, fees, interest rates, and rollback support.

### 2. Bank Staff (`/staff/*`)
- **Staff Operations Center** (`/staff/overview`): Operational KPIs, recent transactions, and activity stream.
- **Register Customer** (`/staff/register-customer`): 5-step guided KYC onboarding (Personal Info, Contact & BD Address, Identity Document Upload, Employment & Nominee, Review & Submit) with draft saving, Bangladesh phone normalization, and duplicate detection.
- **Customer & Account Directories** (`/staff/customers`, `/staff/accounts`, `/staff/create-account`): Search customers/accounts and open new accounts with staff-scoped permissions.
- **Transaction Surveillance** (`/staff/transactions`): Monitor transactions, add investigation notes, and flag suspicious activity.
- **Pending Requests & Loan Applications** (`/staff/requests`, `/staff/loan-applications`): Verify customer requests/loan files and forward escalated cases to Admin.
- **Notifications & Profile** (`/staff/notifications`, `/staff/profile`, `/staff/profile/security`).

### 3. Customer (`/customer/*`)
- **Overview** (`/customer`): Total & available balance summary, monthly inflows, active accounts, quick actions, and alerts.
- **My Accounts** (`/customer/accounts`, `/customer/accounts/[id]`): Ledger/available/held balances, account number masking/reveal, copy, and statements.
- **Transfer Money** (`/customer/transfer`): Atomic account-to-account transfers with review step, Transaction PIN verification, idempotency protection, and receipt.
- **Transactions** (`/customer/transactions`): Personal transaction history with search, filters, pagination, and receipt drawer.
- **Deposit & Withdraw** (`/customer/deposit`, `/customer/withdraw`): Simulated deposit and withdrawal requests with available-balance fund reservation (`heldAmount`) on pending withdrawals.
- **Loans** (`/customer/loans`, `/customer/loans/apply`, `/customer/loans/[id]`): Loan product rates, application form with EMI estimator, and repayment schedules.
- **Statements** (`/customer/statements`): Ledger-accurate e-statements with opening/closing balances, CSV export, and print/PDF support.
- **NestPay (Upcoming)** (`/customer/nestpay`): Preview of NestPay mobile banking service powered by NestBank.
- **Notifications & Security** (`/customer/notifications`, `/customer/profile`, `/customer/profile/security`): Event notifications and Transaction PIN management.

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root with your MongoDB connection string and secrets:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_32_char_encryption_secret
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```
