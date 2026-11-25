import { getDb } from './mongodb.js';

export const DEFAULT_BANK_SETTINGS = {
    version: 1,
    general: {
        bankName: 'Advanced Digital Bank',
        bankCode: 'ADB',
        supportEmail: 'support@nestbank.com',
        supportPhone: '+8801700000000',
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        financialYearStart: 'January',
        defaultAccountStatus: 'Pending Verification',
        minimumOpeningBalance: 500,
        allowMultipleAccounts: true,
        maximumAccountsPerCustomer: 5,
        requireAccountVerification: true,
    },
    transactionRules: {
        transfer: {
            enabled: true,
            minAmount: 100,
            maxAmount: 100000,
            dailyLimit: 200000,
            monthlyLimit: 1000000,
            dailyCountLimit: 20,
            minRemainingBalance: 500,
        },
        withdrawal: {
            enabled: true,
            minAmount: 100,
            maxAmount: 50000,
            dailyLimit: 100000,
            monthlyLimit: 500000,
            dailyCountLimit: 10,
        },
        deposit: {
            enabled: true,
            minAmount: 100,
            maxAmount: 200000,
            dailyLimit: 500000,
            monthlyLimit: 2000000,
        },
        restrictions: {
            allowInterCustomerTransfers: true,
            allowOwnAccountTransfers: true,
            allowDeposits: true,
            allowWithdrawals: true,
            requireApprovalAboveThreshold: true,
            approvalThreshold: 100000,
            requireReviewLargeTransfers: true,
            blockFrozenAccounts: true,
        }
    },
    fees: {
        transfer: { enabled: true, type: 'FIXED', value: 10, minFee: 10, maxFee: 50 },
        deposit: { enabled: true, type: 'FIXED', value: 0, minFee: 0, maxFee: 0 },
        withdrawal: { enabled: true, type: 'PERCENTAGE', value: 1.0, minFee: 10, maxFee: 200 },
        accountOpening: { enabled: true, type: 'FIXED', value: 100, minFee: 100, maxFee: 100 },
        loanProcessing: { enabled: true, type: 'FIXED', value: 200, minFee: 200, maxFee: 1000 },
        loanRepayment: { enabled: true, type: 'FIXED', value: 0, minFee: 0, maxFee: 0 },
    },
    interestRates: [
        { accountType: 'Savings', annualRate: 4.5, calculationMethod: 'Daily balance', postingFrequency: 'Monthly', minimumBalance: 500, enabled: true },
        { accountType: 'Current', annualRate: 0.0, calculationMethod: 'None', postingFrequency: 'None', minimumBalance: 1000, enabled: true },
        { accountType: 'Student Savings', annualRate: 5.0, calculationMethod: 'Daily balance', postingFrequency: 'Quarterly', minimumBalance: 100, enabled: true },
        { accountType: 'Fixed Deposit', annualRate: 7.0, calculationMethod: 'Fixed term', postingFrequency: 'At maturity', minimumBalance: 10000, enabled: true },
    ],
    loanPolicies: [
        { loanType: 'Personal Loan', annualRate: 12.0, interestMethod: 'REDUCING_BALANCE', minAmount: 20000, maxAmount: 500000, minDurationMonths: 6, maxDurationMonths: 36, minMonthlyIncome: 15000, processingFee: 200, enabled: true },
        { loanType: 'Education Loan', annualRate: 8.0, interestMethod: 'REDUCING_BALANCE', minAmount: 50000, maxAmount: 1000000, minDurationMonths: 12, maxDurationMonths: 60, minMonthlyIncome: 20000, processingFee: 300, enabled: true },
        { loanType: 'Home Loan', annualRate: 9.0, interestMethod: 'REDUCING_BALANCE', minAmount: 500000, maxAmount: 5000000, minDurationMonths: 36, maxDurationMonths: 240, minMonthlyIncome: 50000, processingFee: 1000, enabled: true },
        { loanType: 'Business Loan', annualRate: 14.0, interestMethod: 'FLAT', minAmount: 100000, maxAmount: 2000000, minDurationMonths: 12, maxDurationMonths: 60, minMonthlyIncome: 40000, processingFee: 500, enabled: true },
    ],
    riskRules: {
        largeTransferAlert: 100000,
        largeWithdrawalAlert: 50000,
        multipleTransactionsCount: 10,
        multipleTransactionsWindowMinutes: 10,
        failedLoginAlert: 5,
        enableLargeTransactionDetection: true,
        enableRepeatedTransactionDetection: true,
        enableMultipleFailedLoginDetection: true,
        enableUnusualFrequencyDetection: true,
        enableNewAccountHighValueAlerts: true,
    },
    systemControls: {
        registrationEnabled: true,
        accountOpeningEnabled: true,
        transfersEnabled: true,
        depositsEnabled: true,
        withdrawalsEnabled: true,
        loanApplicationsEnabled: true,
        loanRepaymentEnabled: true,
        maintenanceMode: false,
        maintenanceMessage: 'Banking services are temporarily unavailable due to scheduled maintenance. Please try again later.',
        notifications: {
            inAppNotifications: true,
            emailNotifications: false,
            notifySuccessfulTransfers: true,
            notifyRejectedRequests: true,
            notifyLoanApproval: true,
            notifyAccountStatusChanges: true,
        }
    },
    updatedBy: 'System Administrator',
    updatedAt: new Date()
};

export async function getActiveBankSettings() {
    const db = await getDb();
    let settings = await db.collection('bankSettings').findOne({ _id: 'active_config' });
    if (!settings) {
        settings = { _id: 'active_config', ...DEFAULT_BANK_SETTINGS };
        await db.collection('bankSettings').insertOne(settings);
    }
    return settings;
}
