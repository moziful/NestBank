'use client';

import Pagination from '@/app/components/Pagination';

export default function AuditLogTable({
    logs = [],
    loading,
    pagination,
    onPageChange,
    onSelectLog
}) {
    if (loading) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-primary/5 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="bg-surface border border-primary/20 rounded-xl p-12 text-center shadow-sm">
                <svg className="w-12 h-12 mx-auto opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold">No Audit Records Found</h4>
                <p className="text-xs opacity-60 mt-1">Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    const renderSeverityBadge = (severity) => {
        const s = (severity || 'INFO').toUpperCase();
        if (s === 'CRITICAL' || s === 'SECURITY') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25">
                    Critical
                </span>
            );
        }
        if (s === 'WARNING') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                    Warning
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 opacity-70">
                Info
            </span>
        );
    };

    const renderOutcomeBadge = (outcome) => {
        const o = (outcome || 'SUCCESS').toUpperCase();
        if (o === 'SUCCESS') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    Success
                </span>
            );
        }
        if (o === 'DENIED') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400">
                    Denied
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                Failed
            </span>
        );
    };

    return (
        <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3.5 px-4">Timestamp</th>
                            <th className="py-3.5 px-4">Event ID</th>
                            <th className="py-3.5 px-4">Actor</th>
                            <th className="py-3.5 px-4">Action</th>
                            <th className="py-3.5 px-4">Category</th>
                            <th className="py-3.5 px-4">Target</th>
                            <th className="py-3.5 px-4">Severity</th>
                            <th className="py-3.5 px-4">Outcome</th>
                            <th className="py-3.5 px-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {logs.map((log) => (
                            <tr key={log._id || log.eventId} className="hover:bg-primary/5 transition-colors">
                                <td className="py-3.5 px-4 opacity-70 whitespace-nowrap">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) : '—'}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-medium">
                                    {log.eventId}
                                </td>
                                <td className="py-3.5 px-4">
                                    <div className="font-semibold">{log.actorName}</div>
                                    <span className="text-[10px] opacity-60 font-mono">{log.actorRole}</span>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-accent">
                                    {log.action}
                                </td>
                                <td className="py-3.5 px-4 font-medium">
                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px]">
                                        {log.category}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono opacity-80">
                                    {log.targetId}
                                </td>
                                <td className="py-3.5 px-4">
                                    {renderSeverityBadge(log.severity)}
                                </td>
                                <td className="py-3.5 px-4">
                                    {renderOutcomeBadge(log.outcome)}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onSelectLog(log)}
                                        className="px-2.5 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-semibold transition-colors cursor-pointer text-xs"
                                    >
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                    entityName="events"
                />
            )}
        </div>
    );
}
