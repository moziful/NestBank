// lib/notificationLinks.js - Resolve the respected destination route for any notification

export function resolveNotificationHref(notification, role = 'Customer') {
    if (notification?.href) return notification.href;

    const cat = (notification?.category || '').toUpperCase();
    const text = `${notification?.title || ''} ${notification?.message || ''}`.toLowerCase();

    if (cat === 'TRANSFER' || cat === 'TRANSACTION' || text.includes('transfer') || text.includes('received') || text.includes('transaction')) {
        if (role === 'Admin') return '/admin/transactions';
        if (role === 'Bank Staff') return '/staff/transactions';
        return '/customer/transactions';
    }

    if (cat === 'ACCOUNT' || text.includes('account')) {
        if (role === 'Admin') return '/admin/bank-accounts';
        if (role === 'Bank Staff') return '/staff/accounts';
        return '/customer/accounts';
    }

    if (cat === 'LOAN' || text.includes('loan')) {
        if (role === 'Admin') return '/admin/loans';
        if (role === 'Bank Staff') return '/staff/loan-applications';
        return '/customer/loans';
    }

    if (cat === 'APPROVAL' || cat === 'REQUEST' || text.includes('deposit') || text.includes('withdraw') || text.includes('request')) {
        if (role === 'Admin') return '/admin/approvals';
        if (role === 'Bank Staff') return '/staff/requests';
        return text.includes('withdraw') ? '/customer/withdraw' : '/customer/deposit';
    }

    if (cat === 'SECURITY' || text.includes('pin') || text.includes('security')) {
        if (role === 'Admin') return '/admin/audit-logs';
        if (role === 'Bank Staff') return '/staff/profile/security';
        return '/customer/profile/security';
    }

    if (role === 'Admin') return '/admin/overview';
    if (role === 'Bank Staff') return '/staff/overview';
    return '/customer';
}
