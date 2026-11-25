'use client';

import { FiX } from 'react-icons/fi';

export default function AuditLogDetailsDrawer({ log, onClose }) {
    if (!log) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-xl bg-surface text-primary border-l border-primary/20 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-5 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-primary">Audit Event Details</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.severity === 'CRITICAL'
                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                                    : log.severity === 'WARNING'
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                    : 'bg-primary/10 opacity-70'
                            }`}>
                                {log.severity}
                            </span>
                        </div>
                        <p className="text-xs font-mono opacity-70 mt-0.5">{log.eventId}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-primary/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Action Banner */}
                <div className="p-5 bg-accent/10 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-medium opacity-70">Action Executed</p>
                        <p className="text-lg font-mono font-black text-accent mt-0.5">{log.action}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-medium opacity-70">Outcome</p>
                        <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                            log.outcome === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                        }`}>
                            {log.outcome}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                    {/* Event summary */}
                    <div className="p-4 rounded-xl border border-primary/20 space-y-2 bg-primary/5">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Event Description</h5>
                        <p className="text-sm font-medium">{log.description}</p>
                    </div>

                    {/* Actor Details */}
                    <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Actor Information</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="opacity-60 block">Initiated By</span>
                                <span className="font-semibold">{log.actorName}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Actor Role</span>
                                <span className="font-mono font-semibold text-accent">{log.actorRole}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Actor ID</span>
                                <span className="font-mono">{log.actorId || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Timestamp</span>
                                <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Target Information */}
                    <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Target Resource</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="opacity-60 block">Category</span>
                                <span className="font-semibold">{log.category}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Target Type</span>
                                <span className="font-semibold">{log.targetType}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="opacity-60 block">Target Reference / ID</span>
                                <span className="font-mono font-bold text-accent">{log.targetId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Change Summary if exists */}
                    {log.changes && (
                        <div className="p-4 rounded-xl border border-primary/20 space-y-3 bg-primary/5">
                            <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Change Snapshot</h5>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="font-bold text-rose-600 block mb-1">Previous State</span>
                                    <pre className="font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(log.changes.before || {}, null, 2)}
                                    </pre>
                                </div>
                                <div className="p-2.5 rounded bg-surface border border-primary/10">
                                    <span className="font-bold text-emerald-600 block mb-1">New State</span>
                                    <pre className="font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(log.changes.after || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata & Audit Environment */}
                    <div className="p-4 rounded-xl border border-primary/20 space-y-2 bg-primary/5">
                        <h5 className="font-bold uppercase tracking-wider text-[11px] opacity-70">Origin & Environment</h5>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="opacity-60 block">IP Address</span>
                                <span className="font-mono">{log.metadata?.ipAddress || '192.168.1.1'}</span>
                            </div>
                            <div>
                                <span className="opacity-60 block">Request ID</span>
                                <span className="font-mono">{log.metadata?.requestId || 'REQ-SYS'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="opacity-60 block">User Agent</span>
                                <span className="font-mono text-[10px] opacity-80 break-all">{log.metadata?.userAgent || 'Internal'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
