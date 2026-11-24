'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../providers';

const navItemsByRole = {
  Admin: [
    { label: 'Overview', href: '/admin/overview' },
    { label: 'Customers', href: '/admin/customers' },
    { label: 'Bank Accounts', href: '/admin/bank-accounts' },
    { label: 'Transactions', href: '/admin/transactions' },
    { label: 'Approvals', href: '/admin/approvals' },
    { label: 'Loans', href: '/admin/loans' },
    { label: 'Staff Management', href: '/admin/staff-management' },
    { label: 'Reports & Analytics', href: '/admin/reports-analytics' },
    { label: 'Banking Settings', href: '/admin/banking-settings' },
    { label: 'Audit Logs', href: '/admin/audit-logs' },
    { label: 'Profile', href: '/admin/profile' },
  ],
  'Bank Staff': [
    { label: 'Overview', href: '/staff/overview' },
    { label: 'Register Customer', href: '/staff/register-customer' },
    { label: 'Customers', href: '/staff/customers' },
    { label: 'Create Bank Account', href: '/staff/create-bank-account' },
    { label: 'Account Directory', href: '/staff/account-directory' },
    { label: 'Transactions', href: '/staff/transactions' },
    { label: 'Pending Requests', href: '/staff/pending-requests' },
    { label: 'Loan Applications', href: '/staff/loan-applications' },
    { label: 'Notifications', href: '/staff/notifications' },
    { label: 'Profile', href: '/staff/profile' },
  ],
  Customer: [
    { label: 'Overview', href: '/overview' },
    { label: 'My Accounts', href: '/my-accounts' },
    { label: 'Transfer Money', href: '/transfer-money' },
    { label: 'Transactions', href: '/transactions' },
    { label: 'Deposit', href: '/deposit' },
    { label: 'Withdraw', href: '/withdraw' },
    { label: 'Loans', href: '/loans' },
    { label: 'Statements', href: '/statements' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile & Security', href: '/profile-security' },
  ],
};

export default function SideNav() {
  const pathname = usePathname();
  const { role } = useRole();
  const navItems = navItemsByRole[role];

  return (
    <nav className="h-full w-56 shrink-0 overflow-y-auto bg-primary px-4 py-8 text-surface">
      <ul className="m-0 list-none p-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base no-underline transition-colors ${isActive
                  ? 'bg-accent text-surface'
                  : 'text-surface hover:bg-secondary hover:text-surface'
                  }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
