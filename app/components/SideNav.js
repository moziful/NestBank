'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Admin Sidebar Navigations
const navItems = [
  { label: 'Overview', href: '/overview' },
  { label: 'Customers', href: '/customers' },
  { label: 'Bank Accounts', href: '/bank-accounts' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Approvals', href: '/approvals' },
  { label: 'Loans', href: '/loans' },
  { label: 'Staff Management', href: '/staff-management' },
  { label: 'Reports & Analytics', href: '/reports-analytics' },
  { label: 'Banking Settings', href: '/banking-settings' },
  { label: 'Audit Logs', href: '/audit-logs' },
  { label: 'Profile', href: '/profile' },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="h-full w-56 shrink-0 overflow-y-auto bg-zinc-950 px-4 py-8 text-white">
      <ul className="m-0 list-none p-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base no-underline transition-colors ${isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-zinc-100 hover:bg-zinc-800 hover:text-emerald-400'
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
