'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBell, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function StaffNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then((r) => r.json())
            .then((json) => {
                if (json.success) setNotifications(json.notifications || []);
            })
            .catch((err) => console.error('Failed to fetch staff notifications:', err))
            .finally(() => setLoading(false));
    }, []);

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAll: true }),
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-primary">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FiBell className="text-accent" /> Operational Notifications
                    </h1>
                    <p className="text-sm text-primary/70">
                        Live alerts for customer requests, loan submissions, and verification updates.
                    </p>
                </div>
                {notifications.some((n) => !n.read) && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <p className="py-8 text-center text-sm text-primary/60">Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-primary/20 bg-surface p-10 text-center text-sm text-primary/60">
                    No operational notifications yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const content = (
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 rounded-lg p-2 ${
                                    n.category === 'SECURITY'
                                        ? 'bg-rose-500/10 text-rose-500'
                                        : n.category === 'APPROVAL'
                                        ? 'bg-amber-500/10 text-amber-500'
                                        : 'bg-accent/10 text-accent'
                                }`}>
                                    {n.category === 'SECURITY' ? (
                                        <FiAlertTriangle className="h-4 w-4" />
                                    ) : n.read ? (
                                        <FiCheckCircle className="h-4 w-4" />
                                    ) : (
                                        <FiBell className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold text-primary">{n.title}</h3>
                                        <span className="text-[11px] text-primary/50">
                                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-primary/75">{n.message}</p>
                                </div>
                            </div>
                        );

                        return (
                            <div
                                key={n._id}
                                className={`rounded-xl border p-4 transition ${
                                    n.read
                                        ? 'border-primary/10 bg-surface/50 text-primary/70'
                                        : 'border-accent/40 bg-surface text-primary shadow-sm'
                                }`}
                            >
                                {n.href ? <Link href={n.href} className="block">{content}</Link> : content}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
