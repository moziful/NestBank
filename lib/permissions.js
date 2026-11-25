// lib/permissions.js - Role-based permissions matrix for Admin and Bank Staff

export const PERMISSIONS = {
    // Customers
    CAN_VIEW_CUSTOMERS: ['Admin', 'Bank Staff'],
    CAN_CREATE_CUSTOMER: ['Admin', 'Bank Staff'],
    CAN_EDIT_CUSTOMER: ['Admin', 'Bank Staff'],
    CAN_BLOCK_CUSTOMER: ['Admin'],
    CAN_UNBLOCK_CUSTOMER: ['Admin'],
    CAN_DELETE_CUSTOMER: ['Admin'],
    CAN_EXPORT_CUSTOMERS: ['Admin'],

    // Accounts
    CAN_VIEW_ACCOUNTS: ['Admin', 'Bank Staff'],
    CAN_CREATE_ACCOUNT: ['Admin', 'Bank Staff'],
    CAN_FREEZE_ACCOUNT: ['Admin'],
    CAN_MANAGE_LIMITS: ['Admin'],
    CAN_CLOSE_ACCOUNT: ['Admin'],

    // Transactions
    CAN_VIEW_TRANSACTIONS: ['Admin', 'Bank Staff'],
    CAN_FLAG_TRANSACTION: ['Admin', 'Bank Staff'],
    CAN_ADD_TRANSACTION_NOTES: ['Admin', 'Bank Staff'],
    CAN_CLEAR_FLAG: ['Admin'],
    CAN_EXPORT_TRANSACTIONS: ['Admin'],

    // Requests / Approvals
    CAN_VIEW_REQUESTS: ['Admin', 'Bank Staff'],
    CAN_APPROVE_ROUTINE_REQUEST: ['Admin', 'Bank Staff'],
    CAN_APPROVE_HIGH_VALUE_REQUEST: ['Admin'],
    CAN_FORWARD_TO_ADMIN: ['Bank Staff'],

    // Loans
    CAN_VIEW_LOANS: ['Admin', 'Bank Staff'],
    CAN_REVIEW_LOAN_DOCUMENTS: ['Admin', 'Bank Staff'],
    CAN_ADD_LOAN_NOTES: ['Admin', 'Bank Staff'],
    CAN_APPROVE_LOAN: ['Admin'],
    CAN_DISBURSE_LOAN: ['Admin'],

    // System
    CAN_MANAGE_STAFF: ['Admin'],
    CAN_VIEW_AUDIT_LOGS: ['Admin'],
    CAN_EDIT_SETTINGS: ['Admin'],
};

export function getRolePermissions(role) {
    const isStaff = role === 'Bank Staff';
    const isAdmin = role === 'Admin';

    return {
        role,
        isAdmin,
        isStaff,
        customers: {
            canCreate: true,
            canEdit: true,
            canBlock: isAdmin,
            canUnblock: isAdmin,
            canDelete: false,
            canExport: isAdmin,
        },
        accounts: {
            canCreate: true,
            canFreeze: isAdmin,
            canManageLimits: isAdmin,
            canClose: isAdmin,
        },
        transactions: {
            canView: true,
            canFlag: true,
            canAddNotes: true,
            canClearFlag: isAdmin,
            canExport: isAdmin,
        },
        requests: {
            canView: true,
            canApproveRoutine: true,
            canApproveAll: isAdmin,
            canForwardToAdmin: isStaff,
        },
        loans: {
            canView: true,
            canReview: true,
            canForwardToAdmin: isStaff,
            canApprove: isAdmin,
            canDisburse: isAdmin,
        },
    };
}
