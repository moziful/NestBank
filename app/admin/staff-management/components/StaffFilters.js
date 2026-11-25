'use client';

import { FiSearch, FiRefreshCw, FiDownload } from 'react-icons/fi';

export const DEPARTMENTS = [
    'All',
    'Customer Service',
    'Account Operations',
    'Transaction Operations',
    'Loan Department',
    'Compliance',
    'General Administration',
];

export const STATUSES = ['All', 'Active', 'Inactive', 'Suspended'];

export default function StaffFilters({
    search,
    onSearchChange,
    department,
    onDepartmentChange,
    status,
    onStatusChange,
    sortBy,
    onSortByChange,
    onReset,
    onExportCsv,
}) {
    return (
        <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Search */}
                <div className="flex items-center rounded-lg border border-primary/20 bg-white/20 px-3 py-2 min-w-[200px] flex-1">
                    <FiSearch className="mr-2 h-4 w-4 opacity-60" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name, email, employee ID, phone..."
                        className="w-full bg-transparent outline-none placeholder:text-primary/50 text-xs"
                    />
                </div>

                {/* Department */}
                <select
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium"
                >
                    {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept === 'All' ? 'All Departments' : dept}
                        </option>
                    ))}
                </select>

                {/* Status */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium"
                >
                    {STATUSES.map((st) => (
                        <option key={st} value={st}>
                            {st === 'All' ? 'All Statuses' : st}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value)}
                    className="rounded-lg border border-primary/20 bg-white/20 px-3 py-2 outline-none font-medium"
                >
                    <option value="createdAt">Sort: Joining Date</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="lastLogin">Sort: Last Login</option>
                </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 font-medium hover:bg-secondary hover:text-surface transition-colors"
                    title="Reset all filters"
                >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                </button>
                <button
                    type="button"
                    onClick={onExportCsv}
                    className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-3 py-2 font-semibold hover:bg-secondary transition-colors"
                    title="Export staff directory to CSV"
                >
                    <FiDownload className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                </button>
            </div>
        </div>
    );
}
