'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth, useTheme } from '../providers';
import { FiBell, FiChevronDown, FiLogOut, FiMoon, FiSearch, FiSun, FiShield, FiKey } from 'react-icons/fi';

const searchEntriesByRole = {
    Admin: [
        { label: 'Overview', href: '/admin/overview' },
        { label: 'Staff Management & Provisioning', href: '/admin/staff-management' },
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
        { label: 'Account Directory', href: '/staff/account-directory' },
        { label: 'Transactions', href: '/staff/transactions' },
        { label: 'Pending Requests', href: '/staff/pending-requests' },
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

const overviewPaths = {
    Admin: '/admin/overview',
    'Bank Staff': '/staff/overview',
    Customer: '/customer',
};

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
                    placeholder="Search banking features"
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
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const { user, logout, loading } = useAuth();
    const [query, setQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const role = user?.role || 'Customer';
    const dashboardHref = overviewPaths[role] || '/customer';

    useEffect(() => {
        if (!user) return undefined;
        let cancelled = false;

        async function loadNotifications() {
            try {
                const res = await fetch('/api/notifications');
                const json = await res.json();
                if (!cancelled && json.success) {
                    setNotifications(json.notifications || []);
                    setUnreadCount(json.unreadCount || 0);
                }
            } catch {
                // Ignore transient network errors
            }
        }

        loadNotifications();
        const timer = setInterval(loadNotifications, 25000);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [user, pathname]);

    useEffect(() => {
        if (!notificationsOpen) return undefined;

        function handlePointerDown(event) {
            if (!notificationRef.current?.contains(event.target)) {
                setNotificationsOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setNotificationsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [notificationsOpen]);

    function toggleTheme() {
        setTheme((resolvedTheme ?? 'light') === 'dark' ? 'light' : 'dark');
    }

    async function markNotificationRead(notificationId) {
        setNotifications((prev) =>
            prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotificationsOpen(false);
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });
        } catch {}
    }

    async function markAllNotificationsRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
            });
        } catch {}
    }

    // Hide or simplify navbar on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return (
            <header className="z-40 shrink-0 bg-primary text-surface shadow-sm">
                <div className="flex min-h-16 items-center justify-between px-4 sm:px-6">
                    <Link href="/" aria-label="NestBank" className="flex shrink-0 items-center gap-3">
                        <Image
                            src="/NestBankLogo.jpg"
                            alt="NestBank"
                            width={150}
                            height={31}
                            priority
                            className="h-8 w-[150px] object-contain"
                        />
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        {pathname === '/login' ? (
                            <Link href="/register" className="text-surface hover:text-accent underline">
                                Register Account
                            </Link>
                        ) : (
                            <Link href="/login" className="text-surface hover:text-accent underline">
                                Back to Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        );
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

                {/* Role badge */}
                <div className="hidden items-center gap-2 rounded-full border border-surface/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider sm:flex">
                    <FiShield className="h-3.5 w-3.5 text-accent" />
                    <span>{role}</span>
                </div>

                <SearchBox role={role} query={query} onQueryChange={setQuery} />

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <div className="relative" ref={notificationRef}>
                        <button
                            type="button"
                            aria-label={`Notifications, ${unreadCount} unread`}
                            aria-expanded={notificationsOpen}
                            onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
                            className="relative grid h-10 w-10 place-items-center rounded-md text-surface hover:bg-secondary"
                        >
                            <FiBell aria-hidden="true" className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-surface">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 top-12 z-50 w-72 rounded-md border border-primary/10 bg-surface p-4 text-primary shadow-xl sm:w-80">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                    <h2 className="font-semibold">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <button type="button" onClick={markAllNotificationsRead} className="text-xs font-medium text-accent hover:underline">
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <ul className="divide-y divide-primary/10 max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <li className="py-6 text-center text-xs opacity-65">No notifications yet.</li>
                                    ) : (
                                        notifications.slice(0, 6).map((notification) => {
                                            const isUnread = !notification.read;
                                            const targetHref = notification.href || (role === 'Customer' ? '/customer/notifications' : role === 'Bank Staff' ? '/staff/notifications' : '/admin/overview');
                                            return (
                                                <li key={notification._id}>
                                                    <Link
                                                        href={targetHref}
                                                        onClick={() => markNotificationRead(notification._id)}
                                                        className="flex gap-3 py-3 text-sm hover:text-accent"
                                                    >
                                                        <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-accent' : 'bg-primary/20'}`} />
                                                        <span>
                                                            <span className="mb-1 block font-medium">{notification.title}</span>
                                                            <span className="block text-xs opacity-70">{notification.message}</span>
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                                {role !== 'Admin' && (
                                    <Link
                                        href={role === 'Customer' ? '/customer/notifications' : '/staff/notifications'}
                                        onClick={() => setNotificationsOpen(false)}
                                        className="mt-2 block border-t border-primary/10 pt-2.5 text-center text-xs font-semibold text-accent hover:underline"
                                    >
                                        View all notifications
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

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
                            <Image src="/admin-avatar.svg" alt={user?.name || 'User'} width={34} height={34} className="h-[34px] w-[34px] rounded-full border border-surface/40" />
                            <span className="hidden leading-tight sm:block">
                                <span className="block text-sm font-medium">{user?.name || 'Authorized User'}</span>
                                <span className="block text-[11px] text-surface/75">{user?.role || 'Customer'}</span>
                            </span>
                            <FiChevronDown aria-hidden="true" className="hidden h-4 w-4 sm:block" />
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-10 z-50 w-64 rounded-md border border-primary/10 bg-surface p-4 text-primary shadow-xl">
                                <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                                    <Image src="/admin-avatar.svg" alt="" width={48} height={48} className="h-12 w-12 rounded-full" />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{user?.name || 'User'}</p>
                                        <p className="truncate text-xs opacity-70">{user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <dl className="space-y-2 py-4 text-sm">
                                    <div className="flex justify-between gap-3"><dt className="opacity-70">Role</dt><dd className="font-semibold text-accent">{user?.role}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="opacity-70">Status</dt><dd className="font-medium text-green-600">{user?.status || 'Active'}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="opacity-70">User ID</dt><dd className="font-mono text-xs truncate max-w-[120px]">{user?.id}</dd></div>
                                </dl>

                                {user?.role === 'Customer' && (
                                    <Link
                                        href="/profile-security"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex w-full items-center gap-2 border-t border-primary/10 py-2.5 text-left text-sm font-medium text-primary hover:text-accent"
                                    >
                                        <FiKey aria-hidden="true" className="h-4 w-4" />
                                        Configure PIN
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileOpen(false);
                                        logout();
                                    }}
                                    className="flex w-full items-center gap-2 border-t border-primary/10 pt-3 text-left text-sm font-medium text-red-600 hover:text-red-700"
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
                <span className="rounded bg-accent/30 px-2 py-0.5 text-xs font-semibold">{role}</span>
            </div>
        </header>
    );
}
