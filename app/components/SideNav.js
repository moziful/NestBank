'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers';

const navItemsByRole = {
  Admin: [
    { label: 'Overview', href: '/admin/overview' },
    { label: 'Staff Management', href: '/admin/staff-management' },
    { label: 'Customers', href: '/admin/customers' },
    { label: 'Bank Accounts', href: '/admin/bank-accounts' },
    { label: 'Transactions', href: '/admin/transactions' },
    { label: 'Approvals', href: '/admin/approvals' },
    { label: 'Loans', href: '/admin/loans' },
    { label: 'Audit Logs', href: '/admin/audit-logs' },
    { label: 'Banking Settings', href: '/admin/settings' },
  ],
  'Bank Staff': [
    { label: 'Overview', href: '/staff/overview' },
    { label: 'Register Customer', href: '/staff/register-customer' },
    { label: 'Customers', href: '/staff/customers' },
    { label: 'Accounts', href: '/staff/accounts' },
    { label: 'Transactions', href: '/staff/transactions' },
    { label: 'Pending Requests', href: '/staff/requests' },
    { label: 'Loan Applications', href: '/staff/loan-applications' },
  ],
  Customer: [
    { label: 'Overview', href: '/overview' },
    { label: 'My Accounts', href: '/my-accounts' },
    { label: 'Transfer Money', href: '/transfer-money' },
    { label: 'Transactions', href: '/transactions' },
    { label: 'Configure PIN', href: '/profile-security' },
    { label: 'Statements', href: '/statements' },
  ],
};

export default function SideNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role || 'Customer';
  const navItems = navItemsByRole[role] || navItemsByRole['Customer'];

  return (
    <nav className="h-full w-56 shrink-0 overflow-y-auto bg-primary px-4 py-8 text-surface">
      <div className="mb-6 px-3">
        <p className="text-xs uppercase tracking-wider text-surface/60 font-semibold">Workspace</p>
        <p className="text-sm font-bold text-accent">{role}</p>
      </div>
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
