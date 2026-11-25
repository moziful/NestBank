'use client';

import { useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { DEPARTMENTS } from './StaffFilters';

export default function StaffFormModal({ isOpen, staff, onClose, onSubmit, isSubmitting }) {
    const isEdit = !!staff;

    const [name, setName] = useState(staff?.name || '');
    const [email, setEmail] = useState(staff?.email || '');
    const [phone, setPhone] = useState(staff?.phone || '');
    const [department, setDepartment] = useState(staff?.department || 'Customer Service');
    const [designation, setDesignation] = useState(staff?.designation || 'Banking Officer');
    const [status, setStatus] = useState(staff?.status || 'Active');
    const [password, setPassword] = useState('');
    const [joiningDate, setJoiningDate] = useState(
        staff?.joiningDate
            ? new Date(staff.joiningDate).toISOString().split('T')[0]
            : ''
    );

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name,
            phone,
            department,
            designation,
            status,
            joiningDate,
        };

        if (!isEdit) {
            payload.email = email;
            payload.password = password;
        }

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-primary/20 bg-surface p-6 shadow-2xl text-primary animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-bold">
                        {isEdit ? `Edit Staff: ${staff.name}` : 'Add New Bank Staff'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                    {/* Full Name */}
                    <div>
                        <label className="block font-medium mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Nusrat Jahan"
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                        />
                    </div>

                    {/* Email (only editable on creation) */}
                    <div>
                        <label className="block font-medium mb-1">Email Address *</label>
                        <input
                            type="email"
                            required
                            disabled={isEdit}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nusrat@nestbank.com"
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs disabled:opacity-60"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block font-medium mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+880 1812 000102"
                            className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                        />
                    </div>

                    {/* Department & Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium mb-1">Department *</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            >
                                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Designation *</label>
                            <input
                                type="text"
                                required
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                placeholder="e.g. Credit Assessment Officer"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                    </div>

                    {/* Joining Date & Account Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium mb-1">Joining Date</label>
                            <input
                                type="date"
                                value={joiningDate}
                                onChange={(e) => setJoiningDate(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Initial Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    {/* Temporary Password (only for new accounts) */}
                    {!isEdit && (
                        <div>
                            <label className="block font-medium mb-1">Temporary Password (min 6 chars) *</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-md border border-primary/20 bg-white/20 px-3 py-2 outline-none focus:border-accent text-xs"
                            />
                            <p className="mt-1 text-[10px] opacity-60">
                                Passwords are cryptographic bcrypt hashes and never stored in plaintext.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2 border-t border-primary/10 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-primary/20 px-4 py-2 font-semibold hover:bg-primary/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : isEdit ? 'Update Staff Member' : 'Provision Staff Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
