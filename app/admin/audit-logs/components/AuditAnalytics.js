'use client';

import { useState } from 'react';

export default function AuditAnalytics({ analytics, loading }) {
    const [hoverIndex, setHoverIndex] = useState(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="h-64 rounded-xl border border-primary/20 bg-surface p-5 animate-pulse" />
                <div className="h-64 rounded-xl border border-primary/20 bg-surface p-5 animate-pulse" />
            </div>
        );
    }

    const activityData = analytics?.activityOverTime || [];
    const categoryData = analytics?.eventsByCategory || [];
    const totalCategoryCount = categoryData.reduce((sum, c) => sum + (c.count || 0), 0);

    const maxCount = Math.max(...activityData.map(d => d.count), 5);
    const width = 500;
    const height = 180;
    const padding = 35;

    const points = activityData.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / Math.max(activityData.length - 1, 1);
        const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
        let shortLabel = d.date;
        if (d.date && d.date.includes('-')) {
            const parts = d.date.split('-');
            const day = parts[2];
            const monthNum = parseInt(parts[1], 10);
            const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            shortLabel = `${day} ${mNames[monthNum - 1] || ''}`;
        }
        return { x, y, label: shortLabel, ...d };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
        : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* 1. Audit Activity Over Time (SVG Area Chart) */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-sm font-bold">Audit Activity Over Time</h4>
                        <p className="text-[11px] opacity-70">Daily logged events (last 30 days)</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                        Events / Day
                    </span>
                </div>

                {activityData.length === 0 ? (
                    <div className="h-44 grid place-items-center text-xs opacity-50">
                        No activity records for this period
                    </div>
                ) : (
                    <div className="relative pt-2">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
                            <defs>
                                <linearGradient id="auditGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8a2a78" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#8a2a78" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {[0, 0.5, 1].map((ratio) => {
                                const y = height - padding - ratio * (height - 2 * padding);
                                return (
                                    <g key={ratio}>
                                        <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
                                        <text x={padding - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-current opacity-40 font-mono">
                                            {Math.round(ratio * maxCount)}
                                        </text>
                                    </g>
                                );
                            })}
                            <path d={areaD} fill="url(#auditGradient)" />
                            <path d={pathD} fill="none" stroke="#8a2a78" strokeWidth="2.5" strokeLinecap="round" />
                            {points.map((p, idx) => {
                                const isEveryNth = idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1;
                                return (
                                    <g key={idx} onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
                                        <circle cx={p.x} cy={p.y} r={hoverIndex === idx ? 6 : 3.5} fill="#8a2a78" stroke="var(--color-surface, #fff)" strokeWidth="1.5" className="transition-all" />
                                        {isEveryNth && (
                                            <text x={p.x} y={height - 10} textAnchor="middle" className="text-[9px] fill-current opacity-60">
                                                {p.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {hoverIndex !== null && points[hoverIndex] && (
                            <div
                                className="absolute z-20 rounded-md bg-primary text-surface px-2.5 py-1.5 text-xs shadow-lg pointer-events-none -translate-x-1/2 -top-1"
                                style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
                            >
                                <div className="font-bold text-[11px] text-accent">{points[hoverIndex].date}</div>
                                <div>Recorded: <span className="font-semibold">{points[hoverIndex].count}</span> events</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Events by Category */}
            <div className="rounded-xl border border-primary/20 bg-surface p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h4 className="text-sm font-bold">Events by Category</h4>
                        <p className="text-[11px] opacity-70">Distribution across system modules</p>
                    </div>
                    <span className="text-xs font-bold text-accent">
                        Total: {totalCategoryCount.toLocaleString()}
                    </span>
                </div>

                <div className="space-y-2.5 my-auto">
                    {categoryData.length === 0 ? (
                        <p className="text-xs opacity-50 py-6 text-center">No category breakdown data.</p>
                    ) : (
                        categoryData.slice(0, 5).map((c, idx) => {
                            const pct = totalCategoryCount > 0 ? ((c.count / totalCategoryCount) * 100).toFixed(1) : 0;
                            const colors = ['bg-accent', 'bg-emerald-600', 'bg-blue-600', 'bg-amber-600', 'bg-purple-600'];
                            const color = colors[idx % colors.length];

                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium opacity-90">{c.category}</span>
                                        <span className="font-bold">{c.count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
                                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <p className="text-[10px] opacity-60 mt-3 italic">
                    * Append-only immutable log trail. Direct modifications are strictly forbidden.
                </p>
            </div>
        </div>
    );
}
