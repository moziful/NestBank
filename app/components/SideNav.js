'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers';
import { FiX } from 'react-icons/fi';

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
    { label: 'Overview', href: '/customer' },
    { label: 'My Accounts', href: '/customer/accounts' },
    { label: 'Transfer Money', href: '/customer/transfer' },
    { label: 'NestPay', href: '/customer/nestpay', badge: 'Soon' },
    { label: 'Transactions', href: '/customer/transactions' },
    { label: 'Deposit', href: '/customer/deposit' },
    { label: 'Withdraw', href: '/customer/withdraw' },
    { label: 'Loans', href: '/customer/loans' },
    { label: 'Statements', href: '/customer/statements' },
    { label: 'Notifications', href: '/customer/notifications' },
    { label: 'Profile & Security', href: '/customer/profile' },
  ],
};

export default function SideNav({ open = false, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role || 'Customer';
  const navItems = navItemsByRole[role] || navItemsByRole['Customer'];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-dvh w-[280px] max-w-[85vw] shrink-0 overflow-y-auto bg-primary px-4 py-5 text-surface shadow-2xl transition-transform duration-200 md:relative md:inset-auto md:z-auto md:h-full md:w-56 md:max-w-none md:translate-x-0 md:py-8 md:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-6 flex justify-end px-1 md:hidden">
          {onClose && (
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md border border-surface/20 hover:bg-secondary md:hidden"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
        <nav>
          <ul className="m-0 list-none p-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-md px-3 py-2.5 text-base no-underline transition-colors ${isActive
                      ? 'bg-accent text-surface'
                      : 'text-surface hover:bg-secondary hover:text-surface'
                      }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
