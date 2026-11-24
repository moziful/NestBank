'use client';

import { useEffect, useState } from 'react';
import { FiUserPlus, FiUsers, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AdminStaffManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Bank Staff');
    const [status, setStatus] = useState('Active');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleProvisionAccount = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password, role, status }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Provisioning failed');
                setSubmitting(false);
                return;
            }

            setMessage(`Successfully provisioned ${role} account: ${username}`);
            setName('');
            setUsername('');
            setEmail('');
            setPassword('');
            fetchUsers();
        } catch {
            setError('Error submitting provisioning request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status: nextStatus }),
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (err) {
            console.error('Toggle status error', err);
        }
    };

    return (
        <div className="p-6 sm:p-10 max-w-6xl mx-auto text-primary">
            <div className="flex items-center gap-3">
                <FiShield className="h-8 w-8 text-accent" />
                <div>
                    <h1 className="text-2xl font-bold">Admin Account Provisioning & Staff Management</h1>
                    <p className="text-sm opacity-75">Provision and configure Admin, Bank Staff, or Customer accounts with role-based policies</p>
                </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
                {/* Form to provision new account */}
                <div className="lg:col-span-1 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FiUserPlus className="text-accent" />
                        Provision Account
                    </h2>

                    {message && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-xs text-green-700 border border-green-500/30">
                            <FiCheckCircle className="h-4 w-4 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-600 border border-red-500/30">
                            <FiAlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleProvisionAccount} className="mt-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium">Role to Provision</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            >
                                <option value="Bank Staff">Bank Staff</option>
                                <option value="Admin">Administrator</option>
                                <option value="Customer">Customer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium">Initial Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Staff Name"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="staff_username"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@nestbank.com"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium">Temporary Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="mt-1 w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 text-sm outline-none focus:border-accent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
                        >
                            {submitting ? 'Provisioning...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Provisioned Directory */}
                <div className="lg:col-span-2 rounded-xl border border-primary/20 bg-surface p-6 shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FiUsers className="text-accent" />
                        Provisioned Accounts Directory
                    </h2>

                    {loading ? (
                        <p className="mt-4 text-sm opacity-70">Loading accounts...</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-primary/20 font-semibold opacity-70">
                                        <th className="py-2">Name / Email</th>
                                        <th className="py-2">Role</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10">
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td className="py-3">
                                                <div className="font-semibold">{u.name}</div>
                                                <div className="opacity-70">{u.email} ({u.username})</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`rounded px-2 py-0.5 font-medium ${
                                                    u.role === 'Admin' ? 'bg-red-500/20 text-red-700' :
                                                    u.role === 'Bank Staff' ? 'bg-yellow-500/20 text-yellow-800' :
                                                    'bg-green-500/20 text-green-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center gap-1 font-semibold ${
                                                    u.status === 'Active' ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(u._id, u.status)}
                                                    className={`rounded px-2 py-1 text-[11px] font-semibold border ${
                                                        u.status === 'Active'
                                                            ? 'border-red-400 text-red-600 hover:bg-red-50'
                                                            : 'border-green-500 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
