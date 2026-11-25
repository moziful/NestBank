export function formatBDT(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '৳0.00';
    const num = Number(amount);
    if (num >= 10000000) {
        return `৳${(num / 10000000).toFixed(2)}Cr`;
    }
    if (num >= 100000) {
        return `৳${(num / 100000).toFixed(2)}L`;
    }
    return `৳${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
