'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
    pagination,
    onPageChange,
    onLimitChange,
    entityName = 'records'
}) {
    if (!pagination || (pagination.total === 0 && pagination.totalPages <= 1)) {
        return null;
    }

    const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-primary/10 px-4 py-3 text-xs gap-3">
            <div className="flex items-center gap-3">
                <span className="opacity-70">
                    Showing {startRecord} - {endRecord} of {pagination.total} {entityName}
                </span>

                {onLimitChange && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-primary/10">
                        <span className="opacity-60 text-[11px]">Rows:</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="bg-transparent border border-primary/20 rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                    className="p-1.5 rounded-md border border-primary/20 hover:bg-primary/10 disabled:opacity-40 cursor-pointer transition-colors"
                    aria-label="Previous page"
                >
                    <FiChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-xs">
                    {pagination.page} / {Math.max(pagination.totalPages, 1)}
                </span>
                <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                    className="p-1.5 rounded-md border border-primary/20 hover:bg-primary/10 disabled:opacity-40 cursor-pointer transition-colors"
                    aria-label="Next page"
                >
                    <FiChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
