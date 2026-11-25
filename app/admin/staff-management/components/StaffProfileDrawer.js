'use client';

import { useState } from 'react';
import { FiX, FiShield, FiKey, FiClock, FiActivity } from 'react-icons/fi';
import StaffStatusBadge from './StaffStatusBadge';

export default function StaffProfileDrawer({ isOpen, staff, onClose, onEdit, onStatusChange, onResetPassword }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview or activity

    if (!isOpen || !staff) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-surface border-l border-primary/20 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-primary animate-in slide-in-from-right duration-200">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-accent text-white font-bold text-lg grid place-items-center">
                                {staff.name
                                    ? staff.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .slice(0, 2)
                                          .join('')
                                    : 'ST'}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{staff.name}</h2>
                                <p className="text-xs opacity-75">{staff.designation} · {staff.department}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Quick status bar */}
                    <div className="flex items-center justify-between py-3 border-b border-primary/10 text-xs">
                        <span className="font-mono text-accent font-semibold">{staff.employeeId}</span>
                        <StaffStatusBadge status={staff.status || 'Active'} />
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-primary/10 mt-3 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
                                activeTab === 'overview' ? 'border-accent text-accent' : 'border-transparent opacity-60'
                            }`}
                        >
                            Profile Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
                                activeTab === 'security' ? 'border-accent text-accent' : 'border-transparent opacity-60'
                            }`}
                        >
                            Role & Security
                        </button>
                    </div>

                    {/* Tab 1: Profile Overview */}
                    {activeTab === 'overview' && (
                        <div className="mt-4 space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Email Address</span>
                                <span className="font-medium">{staff.email}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Phone Number</span>
                                <span className="font-medium">{staff.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Department</span>
                                <span className="font-medium">{staff.department}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Designation</span>
                                <span className="font-medium">{staff.designation}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Assigned Role</span>
                                <span className="font-semibold text-accent">{staff.role || 'Bank Staff'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Joining Date</span>
                                <span className="font-medium">
                                    {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Last Successful Login</span>
                                <span className="font-medium">
                                    {staff.lastLogin ? new Date(staff.lastLogin).toLocaleString() : 'Never logged in'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Security & Permissions */}
                    {activeTab === 'security' && (
                        <div className="mt-4 space-y-3 text-xs">
                            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
                                <div className="flex items-center gap-2 font-semibold text-primary">
                                    <FiShield className="text-accent" />
                                    <span>Access Control Policy</span>
                                </div>
                                <p className="mt-1 text-[11px] opacity-75 leading-relaxed">
                                    Staff members possess standard <strong className="text-accent">BANK_STAFF</strong> operational permissions (Customer onboarding, transaction processing, and account management). Staff cannot access Admin-only APIs or bank-wide financial configurations.
                                </p>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Password Storage</span>
                                <span className="font-semibold text-emerald-600">Bcrypt (Salt 10)</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Password Change Required</span>
                                <span className="font-medium">{staff.requirePasswordChange ? 'Yes (Next Login)' : 'No'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-primary/5">
                                <span className="opacity-70">Account Provisioned</span>
                                <span className="font-medium">{new Date(staff.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 border-t border-primary/10 pt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(staff)}
                        className="flex-1 rounded-lg border border-primary/20 py-2 text-xs font-semibold hover:bg-primary/5 transition-colors text-center"
                    >
                        Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => onResetPassword(staff)}
                        className="rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold hover:bg-amber-500/10 text-amber-700 transition-colors"
                    >
                        Reset Password
                    </button>
                    {staff.status === 'Active' ? (
                        <button
                            type="button"
                            onClick={() => onStatusChange(staff)}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                        >
                            Deactivate
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onStatusChange({ ...staff, targetStatus: 'Active' })}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                            Activate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
