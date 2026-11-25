'use client';

import Link from 'next/link';
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi';

export default function DuplicateCustomerWarning({ matches = [], checking = false }) {
    if (checking) {
        return (
            <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-3 text-xs text-primary/60">
                Checking for duplicate customer records...
            </div>
        );
    }

    if (!matches || matches.length === 0) return null;

    return (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
                <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Possible Duplicate Customer Detected
                    </h4>
                    <p className="text-[11px] text-primary/80 mt-0.5">
                        A customer record with a matching mobile number, email, or identity document may already exist.
                    </p>
                </div>
            </div>

            <div className="space-y-2 pt-1">
                {matches.map((m, idx) => (
                    <div
                        key={m.customerId || idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-surface p-2.5 text-xs"
                    >
                        <div className="min-w-0">
                            <p className="font-bold text-primary truncate">
                                {m.customerId} • {m.name}
                            </p>
                            <p className="text-[10px] text-primary/60">
                                Matched on: {(m.matchTypes || []).join(', ')}
                            </p>
                        </div>
                        {m.id && (
                            <Link
                                href={`/staff/customers/${m.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 shrink-0"
                            >
                                View Record <FiExternalLink className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
