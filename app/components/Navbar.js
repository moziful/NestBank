'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { FiBell, FiChevronDown, FiLogOut, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { useRole } from '../providers';

const searchEntriesByRole = {
    Admin: [
        { label: 'Overview', href: '/admin/overview' },
        { label: 'Customers', href: '/admin/customers' },
        { label: 'Bank Accounts', href: '/admin/bank-accounts' },
        { label: 'Transactions', href: '/admin/transactions' },
        { label: 'Approvals', href: '/admin/approvals' },
        { label: 'Audit Logs', href: '/admin/audit-logs' },
    ],
    'Bank Staff': [
        { label: 'Overview', href: '/staff/overview' },
        { label: 'Register Customer', href: '/staff/register-customer' },
        { label: 'Customers', href: '/staff/customers' },
        { label: 'Create Bank Account', href: '/staff/create-bank-account' },
        { label: 'Account Directory', href: '/staff/account-directory' },
        { label: 'Transactions', href: '/staff/transactions' },
        { label: 'Pending Requests', href: '/staff/pending-requests' },
    ],
    Customer: [
        { label: 'Overview', href: '/overview' },
        { label: 'My Accounts', href: '/my-accounts' },
        { label: 'Transfer Money', href: '/transfer-money' },
        { label: 'Transactions', href: '/transactions' },
        { label: 'Statements', href: '/statements' },
    ],
};

const roleOptions = [
    { label: 'Admin', color: 'bg-red-500' },
    { label: 'Bank Staff', color: 'bg-yellow-400' },
    { label: 'Customer', color: 'bg-green-500' },
];

const overviewPaths = {
    Admin: '/admin/overview',
    'Bank Staff': '/staff/overview',
    Customer: '/overview',
};

function RoleSwitcher({ role, onRoleChange }) {
    return (
        <div role="group" aria-label="Temporary role selector" className="flex shrink-0 items-center gap-2">
            {roleOptions.map((option) => (
                <button
                    key={option.label}
                    type="button"
                    aria-label={`Switch role to ${option.label}`}
                    aria-pressed={role === option.label}
                    title={option.label}
                    onClick={() => onRoleChange(option.label)}
                    className={`h-4 w-4 rounded-full ${option.color} ${role === option.label ? 'ring-2 ring-surface ring-offset-2 ring-offset-primary' : 'opacity-75 hover:opacity-100'}`}
                />
            ))}
        </div>
    );
}

function SearchBox({ role, query, onQueryChange, mobile = false }) {
    const matchingEntries = (searchEntriesByRole[role] ?? []).filter(
        (item) => item.label.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const inputId = mobile ? 'mobile-global-search' : 'global-search';

    return (
        <div className={`relative ${mobile ? 'min-w-0 flex-1' : 'ml-auto hidden min-w-40 max-w-xl flex-1 md:block'}`}>
            <label className="sr-only" htmlFor={inputId}>Search banking pages</label>
            <div className="flex h-10 items-center gap-2 rounded-md border border-surface/25 bg-white/10 px-3 focus-within:border-surface/70">
                <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0" />
                <input
                    id={inputId}
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-surface outline-none placeholder:text-surface/70"
                />
            </div>
            {query.trim() && (
                <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-md border border-primary/10 bg-surface py-1 text-primary shadow-xl">
                    {matchingEntries.length ? matchingEntries.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onQueryChange('')}
                            className="block px-4 py-2.5 text-sm hover:bg-secondary hover:text-surface"
                        >
                            {item.label}
                        </Link>
                    )) : (
                        <p className="px-4 py-3 text-sm">No matching pages for your role.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const { role, setRole } = useRole();
    const [query, setQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const dashboardHref = overviewPaths[role];

    function handleRoleChange(nextRole) {
        setRole(nextRole);
        router.push(overviewPaths[nextRole]);
    }

    function toggleTheme() {
        setTheme((resolvedTheme ?? 'light') === 'dark' ? 'light' : 'dark');
    }

    return (
        <header className="z-40 shrink-0 bg-primary text-surface shadow-sm">
            <div className="flex min-h-16 items-center gap-4 border-b border-surface/20 px-4 sm:px-6">
                <Link href={dashboardHref} aria-label="NestBank dashboard" className="flex shrink-0 items-center gap-3">
                    <Image
                        src="/NestBankLogo.jpg"
                        alt="NestBank"
                        width={150}
                        height={31}
                        priority
                        className="h-8 w-[150px] object-contain"
                    />
                </Link>

                <div className="hidden sm:block">
                    <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
                </div>

                <SearchBox role={role} query={query} onQueryChange={setQuery} />

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            aria-label={`Notifications, ${unreadCount} unread`}
                            aria-expanded={notificationsOpen}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative grid h-10 w-10 place-items-center rounded-md text-surface hover:bg-secondary"
                        >
                            <FiBell aria-hidden="true" className="h-5 w-5" />
                            {unreadCount > 0 && <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-surface">{unreadCount}</span>}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 top-12 z-50 w-72 rounded-md border border-primary/10 bg-surface p-4 text-primary shadow-xl sm:w-80">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                    <h2 className="font-semibold">Notifications</h2>
                                    {unreadCount > 0 && <button type="button" onClick={() => setUnreadCount(0)} className="text-xs font-medium text-accent hover:underline">Mark all read</button>}
                                </div>
                                {unreadCount > 0 ? (
                                    <ul className="divide-y divide-primary/10">
                                        <li className="py-3 text-sm"><span className="mb-1 block font-medium">Approval requested</span><span className="text-xs opacity-70">A transfer is waiting for review.</span></li>
                                        <li className="py-3 text-sm"><span className="mb-1 block font-medium">New customer registered</span><span className="text-xs opacity-70">A customer profile needs verification.</span></li>
                                        <li className="pt-3 text-sm"><span className="mb-1 block font-medium">Daily report ready</span><span className="text-xs opacity-70">Your operations summary is available.</span></li>
                                    </ul>
                                ) : <p className="pt-4 text-sm opacity-70">You are all caught up.</p>}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                        disabled
                        onClick={toggleTheme}
                        className="grid h-10 w-10 place-items-center rounded-md text-surface hover:bg-secondary"
                    >
                        <FiMoon aria-hidden="true" className="h-5 w-5 dark:hidden" />
                        <FiSun aria-hidden="true" className="hidden h-5 w-5 dark:block" />
                    </button>

                    <div
                        className="relative"
                        onMouseEnter={() => setProfileOpen(true)}
                        onMouseLeave={() => setProfileOpen(false)}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
                        }}
                    >
                        <button
                            type="button"
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                            onClick={() => setProfileOpen(true)}
                            onFocus={() => setProfileOpen(true)}
                            className="flex h-10 items-center gap-2 rounded-md px-1.5 text-left hover:bg-secondary sm:px-2"
                        >
                            <Image src="/admin-avatar.svg" alt="Alex Morgan" width={34} height={34} className="h-[34px] w-[34px] rounded-full border border-surface/40" />
                            <span className="hidden leading-tight sm:block">
                                <span className="block text-sm font-medium">Alex Morgan</span>
                                <span className="block text-[11px] text-surface/75">{role === 'Admin' ? 'Administrator' : role}</span>
                            </span>
                            <FiChevronDown aria-hidden="true" className="hidden h-4 w-4 sm:block" />
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-10 z-50 w-64 rounded-md border border-primary/10 bg-surface p-4 text-primary shadow-xl">
                                <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                                    <Image src="/admin-avatar.svg" alt="" width={48} height={48} className="h-12 w-12 rounded-full" />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">Alex Morgan</p>
                                        <p className="truncate text-xs opacity-70">alex.morgan@nestbank.com</p>
                                    </div>
                                </div>
                                <dl className="space-y-2 py-4 text-sm">
                                    <div className="flex justify-between gap-3"><dt className="opacity-70">Role</dt><dd className="font-medium">{role}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="opacity-70">Access</dt><dd className="font-medium">Bank operations</dd></div>
                                </dl>
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex w-full items-center gap-2 border-t border-primary/10 pt-3 text-left text-sm font-medium text-accent hover:text-secondary"
                                >
                                    <FiLogOut aria-hidden="true" className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 md:hidden">
                <SearchBox mobile role={role} query={query} onQueryChange={setQuery} />
                <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
            </div>

        </header>
    );
}
