import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d'; // today, 7d, 30d, this_month, this_year, all

        const db = await getDb();
        const now = new Date();
        let startDate = new Date();

        if (range === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (range === '7d') {
            startDate.setDate(now.getDate() - 7);
        } else if (range === '30d') {
            startDate.setDate(now.getDate() - 30);
        } else if (range === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (range === 'this_year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }

        // 1. KPI Metrics
        // Total Customers (Lifetime)
        const totalCustomers = await db.collection('users').countDocuments({ role: 'Customer' });

        // Total Bank Accounts (Lifetime)
        const totalBankAccounts = await db.collection('accounts').countDocuments();

        // Total Bank Balance (Combined customer accounts)
        const balanceAgg = await db.collection('accounts').aggregate([
            { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
        ]).toArray();
        const totalBankBalance = balanceAgg[0]?.totalBalance || 0;

        // Total Transactions in selected period
        const totalTransactions = await db.collection('transactions').countDocuments({
            createdAt: { $gte: startDate }
        });

        // Deposits in selected period
        const depositAgg = await db.collection('transactions').aggregate([
            { $match: { type: 'Deposit', status: 'Completed', createdAt: { $gte: startDate } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]).toArray();
        const totalDeposits = depositAgg[0]?.totalAmount || 0;

        // Withdrawals in selected period
        const withdrawalAgg = await db.collection('transactions').aggregate([
            { $match: { type: 'Withdrawal', status: 'Completed', createdAt: { $gte: startDate } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]).toArray();
        const totalWithdrawals = withdrawalAgg[0]?.totalAmount || 0;

        // Pending Loans
        const pendingLoans = await db.collection('loans').countDocuments({
            status: { $in: ['Pending', 'Under Review'] }
        });

        // 2. Visualizations Data
        // A. Monthly Transaction Volume (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyTxAgg = await db.collection('transactions').aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    volume: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const transactionVolume = monthlyTxAgg.map(item => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year.toString().slice(-2)}`,
            count: item.count,
            volume: item.volume
        }));

        // B. Deposit vs Withdrawal Comparison (monthly)
        const depositVsWithdrawalAgg = await db.collection('transactions').aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: 'Completed',
                    type: { $in: ['Deposit', 'Withdrawal'] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        const monthlyCashFlowMap = {};
        depositVsWithdrawalAgg.forEach(item => {
            const label = `${monthNames[item._id.month - 1]}`;
            if (!monthlyCashFlowMap[label]) {
                monthlyCashFlowMap[label] = { month: label, deposits: 0, withdrawals: 0 };
            }
            if (item._id.type === 'Deposit') {
                monthlyCashFlowMap[label].deposits = item.total;
            } else if (item._id.type === 'Withdrawal') {
                monthlyCashFlowMap[label].withdrawals = item.total;
            }
        });
        const depositVsWithdrawal = Object.values(monthlyCashFlowMap);

        // C. Account Distribution (Savings, Current, Business)
        const accountDistAgg = await db.collection('accounts').aggregate([
            {
                $group: {
                    _id: '$accountType',
                    count: { $sum: 1 },
                    totalBalance: { $sum: '$balance' }
                }
            }
        ]).toArray();

        const totalAccCount = accountDistAgg.reduce((acc, cur) => acc + cur.count, 0) || 1;
        const accountDistribution = accountDistAgg.map(item => ({
            type: item._id || 'Standard',
            count: item.count,
            percentage: Math.round((item.count / totalAccCount) * 100),
            totalBalance: item.totalBalance
        }));

        // D. Loan Approval Statistics
        const loanStatsAgg = await db.collection('loans').aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]).toArray();

        const loanStatistics = loanStatsAgg.map(item => ({
            status: item._id,
            count: item.count,
            amount: item.totalAmount
        }));

        // E. Monthly Banking Activity (combined breakdown)
        const bankingActivityAgg = await db.collection('transactions').aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            }
        ]).toArray();

        const activityMap = {};
        bankingActivityAgg.forEach(item => {
            const label = monthNames[item._id.month - 1];
            if (!activityMap[label]) {
                activityMap[label] = { month: label, Deposit: 0, Withdrawal: 0, Transfer: 0, Total: 0 };
            }
            activityMap[label][item._id.type] = (activityMap[label][item._id.type] || 0) + item.amount;
            activityMap[label].Total += item.amount;
        });
        const monthlyBankingActivity = Object.values(activityMap);

        // 3. Recent Transactions (last 10)
        const recentTransactions = await db.collection('transactions')
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        // 4. Pending Approvals Summary
        const pendingDeposits = await db.collection('bankingRequests').countDocuments({ category: 'Deposit', status: 'Pending' });
        const pendingWithdrawals = await db.collection('bankingRequests').countDocuments({ category: 'Withdrawal', status: 'Pending' });
        const pendingLoanApps = await db.collection('loans').countDocuments({ status: { $in: ['Pending', 'Under Review'] } });
        const suspiciousAlerts = await db.collection('bankingRequests').countDocuments({ status: 'Flagged' });

        const pendingApprovals = [
            { category: 'Deposit Requests', count: pendingDeposits, detail: 'Awaiting admin / staff clearance', href: '/admin/approvals?type=deposits' },
            { category: 'Withdrawal Requests', count: pendingWithdrawals, detail: 'High-value transactions pending approval', href: '/admin/approvals?type=withdrawals' },
            { category: 'Loan Applications', count: pendingLoanApps, detail: 'Credit risk assessment required', href: '/admin/loans' },
            { category: 'Suspicious Activity', count: suspiciousAlerts, detail: 'Flagged for fraud/AML audit', href: '/admin/audit-logs?filter=flagged' },
        ];

        // 5. System Activity / Audit Logs
        const systemActivities = await db.collection('auditLogs')
            .find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .toArray();

        return NextResponse.json({
            success: true,
            range,
            kpis: {
                totalCustomers,
                totalBankAccounts,
                totalBankBalance,
                totalTransactions,
                totalDeposits,
                totalWithdrawals,
                pendingLoans
            },
            analytics: {
                transactionVolume,
                depositVsWithdrawal,
                accountDistribution,
                loanStatistics,
                monthlyBankingActivity
            },
            recentTransactions,
            pendingApprovals,
            systemActivities
        });
    } catch (error) {
        console.error('Admin Overview API error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
