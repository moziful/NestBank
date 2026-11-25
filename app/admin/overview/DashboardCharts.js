'use client';

import { useState } from 'react';

// Formatter helper for BDT currency
export function formatBDT(amount) {
    if (amount >= 10000000) {
        return `৳${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
        return `৳${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000) {
        return `৳${(amount / 1000).toFixed(1)}k`;
    }
    return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

// 1. Monthly Transaction Volume (Interactive Area / Line Chart)
export function TransactionVolumeChart({ data = [] }) {
    const [hoverIndex, setHoverIndex] = useState(null);

    if (!data.length) {
        return <div className="h-48 grid place-items-center text-xs opacity-50">No transaction data available</div>;
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const width = 500;
    const height = 180;
    const padding = 30;

    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1 || 1);
        const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
        return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
                <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8a2a78" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8a2a78" stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                {/* Horizontal guide lines */}
                {[0, 0.5, 1].map((ratio) => {
                    const y = height - padding - ratio * (height - 2 * padding);
                    return (
                        <g key={ratio}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
                            <text x={padding - 5} y={y + 3} textAnchor="end" className="text-[9px] fill-current opacity-40">
                                {Math.round(ratio * maxCount)}
                            </text>
                        </g>
                    );
                })}
                {/* Area fill */}
                <path d={areaD} fill="url(#volumeGradient)" />
                {/* Line */}
                <path d={pathD} fill="none" stroke="#8a2a78" strokeWidth="2.5" strokeLinecap="round" />
                {/* Interactive Points */}
                {points.map((p, idx) => (
                    <g key={idx} onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
                        <circle cx={p.x} cy={p.y} r={hoverIndex === idx ? 6 : 4} fill="#8a2a78" className="transition-all" />
                        <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-current opacity-70">
                            {p.month}
                        </text>
                    </g>
                ))}
            </svg>
            {hoverIndex !== null && points[hoverIndex] && (
                <div
                    className="absolute z-20 rounded bg-primary text-surface px-2 py-1 text-xs shadow pointer-events-none -translate-x-1/2 -top-2"
                    style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
                >
                    <div className="font-bold">{points[hoverIndex].month}</div>
                    <div>Count: {points[hoverIndex].count} txns</div>
                    <div>Vol: {formatBDT(points[hoverIndex].volume)}</div>
                </div>
            )}
        </div>
    );
}

// 2. Deposit vs Withdrawal (Grouped Bar Chart)
export function DepositVsWithdrawalChart({ data = [] }) {
    if (!data.length) {
        return <div className="h-48 grid place-items-center text-xs opacity-50">No cash flow data available</div>;
    }

    const maxVal = Math.max(...data.flatMap(d => [d.deposits, d.withdrawals]), 1000);
    const height = 140;

    return (
        <div>
            <div className="flex items-center gap-4 text-xs mb-3 justify-end">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" /> Deposits</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rose-500 inline-block" /> Withdrawals</span>
            </div>
            <div className="flex items-end justify-between gap-3 h-36 pt-4 border-b border-primary/10">
                {data.map((item, i) => {
                    const depHeight = Math.max((item.deposits / maxVal) * height, 4);
                    const withHeight = Math.max((item.withdrawals / maxVal) * height, 4);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="flex items-end gap-1 w-full justify-center">
                                <div
                                    style={{ height: `${depHeight}px` }}
                                    className="w-3.5 bg-emerald-500 rounded-t transition-all hover:opacity-80"
                                    title={`Deposits: ${formatBDT(item.deposits)}`}
                                />
                                <div
                                    style={{ height: `${withHeight}px` }}
                                    className="w-3.5 bg-rose-500 rounded-t transition-all hover:opacity-80"
                                    title={`Withdrawals: ${formatBDT(item.withdrawals)}`}
                                />
                            </div>
                            <span className="text-[10px] opacity-75">{item.month}</span>
                            <div className="absolute bottom-12 hidden group-hover:block z-20 bg-primary text-surface p-1.5 rounded text-[10px] whitespace-nowrap shadow">
                                <p className="font-semibold">{item.month}</p>
                                <p className="text-emerald-400">Dep: {formatBDT(item.deposits)}</p>
                                <p className="text-rose-400">With: {formatBDT(item.withdrawals)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// 3. Account Distribution (Donut Chart)
export function AccountDistributionChart({ data = [] }) {
    if (!data.length) {
        return <div className="h-44 grid place-items-center text-xs opacity-50">No accounts</div>;
    }

    const colors = {
        Savings: '#8a2a78',
        Current: '#500071',
        Business: '#f59e0b',
        Standard: '#3b82f6',
    };

    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    let accumulatedAngle = 0;

    return (
        <div className="flex items-center justify-around gap-4 py-2">
            <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((item, idx) => {
                        const strokeDasharray = `${(item.count / total) * 251.2} 251.2`;
                        const strokeDashoffset = -accumulatedAngle;
                        accumulatedAngle += (item.count / total) * 251.2;
                        return (
                            <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke={colors[item.type] || '#8a2a78'}
                                strokeWidth="18"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all hover:opacity-90 cursor-pointer"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-xs font-semibold opacity-60">Total</span>
                    <span className="text-sm font-bold">{total}</span>
                </div>
            </div>
            <div className="space-y-2 text-xs">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[item.type] || '#8a2a78' }} />
                        <div>
                            <p className="font-semibold">{item.type}</p>
                            <p className="opacity-60">{item.count} ({item.percentage}%)</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 4. Loan Approval Statistics (Status Progression / Bar)
export function LoanApprovalChart({ data = [] }) {
    if (!data.length) {
        return <div className="h-44 grid place-items-center text-xs opacity-50">No loan records</div>;
    }

    const statusColors = {
        Pending: 'bg-amber-500',
        'Under Review': 'bg-blue-500',
        Approved: 'bg-emerald-500',
        Active: 'bg-teal-600',
        Rejected: 'bg-rose-500',
        Completed: 'bg-purple-600',
    };

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-3 pt-2">
            {data.map((item, idx) => (
                <div key={idx} className="text-xs">
                    <div className="flex justify-between mb-1">
                        <span className="font-medium">{item.status}</span>
                        <span className="font-semibold opacity-80">{item.count} apps ({formatBDT(item.amount)})</span>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${statusColors[item.status] || 'bg-accent'}`}
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// 5. Monthly Banking Activity (Combined Stacked / Breakdown)
export function MonthlyBankingActivityChart({ data = [] }) {
    if (!data.length) {
        return <div className="h-44 grid place-items-center text-xs opacity-50">No monthly activity data</div>;
    }

    const maxTotal = Math.max(...data.map(d => d.Total), 1000);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs justify-end">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Deposits</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Withdrawals</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Transfers</span>
            </div>
            <div className="space-y-2.5">
                {data.map((item, idx) => {
                    const depPct = ((item.Deposit || 0) / (item.Total || 1)) * 100;
                    const withPct = ((item.Withdrawal || 0) / (item.Total || 1)) * 100;
                    const trfPct = ((item.Transfer || 0) / (item.Total || 1)) * 100;
                    return (
                        <div key={idx} className="text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium">{item.month}</span>
                                <span className="font-semibold opacity-80">{formatBDT(item.Total)} total flow</span>
                            </div>
                            <div className="w-full bg-primary/10 rounded-full h-3 flex overflow-hidden">
                                <div style={{ width: `${depPct}%` }} className="bg-emerald-500 h-full" title={`Deposits: ${formatBDT(item.Deposit)}`} />
                                <div style={{ width: `${withPct}%` }} className="bg-rose-500 h-full" title={`Withdrawals: ${formatBDT(item.Withdrawal)}`} />
                                <div style={{ width: `${trfPct}%` }} className="bg-indigo-500 h-full" title={`Transfers: ${formatBDT(item.Transfer)}`} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
