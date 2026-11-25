'use client';

export default function ChangeHistoryTab({ history = [], onRestore, restoring }) {
    if (!history || history.length === 0) {
        return (
            <div className="rounded-xl border border-primary/20 bg-surface p-12 text-center text-xs shadow-sm">
                <p className="opacity-60">No configuration snapshots recorded yet. Modifications will appear here.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm space-y-4 text-xs">
            <div>
                <h4 className="text-sm font-bold text-primary">Configuration Snapshot History</h4>
                <p className="text-[11px] opacity-70">
                    Immutable history of prior configuration versions with instant rollback capability.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-primary/5 border-b border-primary/10 opacity-70 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-3">Version</th>
                            <th className="py-3 px-3">Timestamp</th>
                            <th className="py-3 px-3">Modified By</th>
                            <th className="py-3 px-3">Reason / Scope</th>
                            <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        {history.map((h, idx) => (
                            <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-accent">
                                    v{h.version}
                                </td>
                                <td className="py-3 px-3 opacity-70 whitespace-nowrap">
                                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}
                                </td>
                                <td className="py-3 px-3 font-semibold">{h.changedBy}</td>
                                <td className="py-3 px-3 opacity-80">{h.reason}</td>
                                <td className="py-3 px-3 text-right">
                                    <button
                                        type="button"
                                        disabled={restoring}
                                        onClick={() => onRestore(h.version)}
                                        className="px-3 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent font-semibold text-xs cursor-pointer transition-colors disabled:opacity-40"
                                    >
                                        Rollback to v{h.version}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
