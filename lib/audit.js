import { getDb } from '@/lib/mongodb';

/**
 * Standard Server-Side Audit Service
 * Append-only security logging for all banking activities.
 * Never logs plaintext credentials, tokens, or PINs.
 */
export async function createAuditLog({
    eventId,
    actorId,
    actorName,
    actorRole = 'SYSTEM', // ADMIN, BANK_STAFF, CUSTOMER, SYSTEM
    action,
    category = 'SYSTEM', // AUTHENTICATION, CUSTOMER, STAFF, ACCOUNT, TRANSACTION, APPROVAL, LOAN, SECURITY, SYSTEM
    targetType, // User, Account, Transaction, Loan, Request, Settings
    targetId,
    description,
    severity = 'INFO', // INFO, WARNING, CRITICAL
    outcome = 'SUCCESS', // SUCCESS, FAILED, DENIED
    changes = null, // { before, after }
    metadata = null, // { ipAddress, userAgent, requestId, correlationId }
}) {
    try {
        const db = await getDb();
        const now = new Date();
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const generatedEventId = eventId || `EVT-${dateStr}-${randomSuffix}`;

        // Redact any accidentally passed sensitive parameters
        let sanitizedChanges = null;
        if (changes) {
            const redactKeys = ['password', 'pin', 'token', 'secret', 'hash', 'session'];
            const sanitize = (obj) => {
                if (!obj || typeof obj !== 'object') return obj;
                const copy = { ...obj };
                for (const key of Object.keys(copy)) {
                    if (redactKeys.some(r => key.toLowerCase().includes(r))) {
                        copy[key] = '[REDACTED]';
                    }
                }
                return copy;
            };

            sanitizedChanges = {
                before: sanitize(changes.before),
                after: sanitize(changes.after)
            };
        }

        const logEntry = {
            eventId: generatedEventId,
            actorId: actorId ? actorId.toString() : null,
            actorName: actorName || 'System',
            actorRole: actorRole.toUpperCase(),
            action: action.toUpperCase(),
            category: category.toUpperCase(),
            targetType: targetType || 'General',
            targetId: targetId ? targetId.toString() : null,
            description,
            severity: severity.toUpperCase(), // INFO, WARNING, CRITICAL
            outcome: outcome.toUpperCase(), // SUCCESS, FAILED, DENIED
            changes: sanitizedChanges,
            metadata: metadata || {
                ipAddress: '127.0.0.1',
                userAgent: 'Internal System Engine'
            },
            createdAt: now
        };

        await db.collection('auditLogs').insertOne(logEntry);
        return { success: true, eventId: generatedEventId };
    } catch (err) {
        console.error('Failed to create audit log entry:', err);
        return { success: false, error: err.message };
    }
}
