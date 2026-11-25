'use client';

import { useState } from 'react';
import { FiBell, FiCheckCircle, FiClock, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function StaffNotificationsPage() {
    const [notifications, setNotifications] = useState([
        {
            id: 'n1',
            title: 'New Deposit Request #DEP-9041',
            desc: 'A customer submitted a deposit request of ৳45,000 for review.',
            time: '12 minutes ago',
            type: 'request',
            read: false,
        },
        {
            id: 'n2',
            title: 'High-Value Transfer Flagged',
            desc: 'System automated AML engine flagged a transfer of ৳350,000.',
            time: '1 hour ago',
            type: 'alert',
            read: false,
        },
        {
            id: 'n3',
            title: 'Loan File Forwarded to Admin',
            desc: 'Loan application LN-5012 was acknowledged by Admin underwriting desk.',
            time: '3 hours ago',
            type: 'info',
            read: true,
        },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Operational Notifications</h1>
                    <p className="text-sm text-primary/70">
                        Alerts, verification alerts, and request updates assigned to bank staff.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-3">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`rounded-xl border p-4 transition ${
                            n.read
                                ? 'border-primary/10 bg-surface/50 text-primary/70'
                                : 'border-accent/40 bg-surface text-primary shadow-sm'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 rounded-lg p-2 ${
                                n.type === 'alert'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : n.type === 'request'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-accent/10 text-accent'
                            }`}>
                                {n.type === 'alert' ? <FiAlertTriangle className="h-4 w-4" /> : <FiBell className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-primary">{n.title}</h3>
                                    <span className="text-xs text-primary/50">{n.time}</span>
                                </div>
                                <p className="text-xs text-primary/70">{n.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
