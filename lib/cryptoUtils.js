// lib/cryptoUtils.js - Server-only encryption & keyed hashing for sensitive identity numbers
import crypto from 'crypto';

function getEncryptionKey() {
    const raw = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'nestbank-identity-encryption-secret';
    return crypto.createHash('sha256').update(String(raw)).digest();
}

/**
 * Compute deterministic keyed HMAC-SHA256 hash for duplicate detection
 * without storing or indexing plaintext NID/Passport numbers.
 */
export function hashDocumentNumber(docNumber) {
    if (!docNumber) return '';
    const normalized = String(docNumber).trim().toUpperCase();
    const key = getEncryptionKey();
    return crypto.createHmac('sha256', key).update(normalized).digest('hex');
}

/**
 * Encrypt document number using AES-256-GCM.
 */
export function encryptDocumentNumber(docNumber) {
    if (!docNumber) return '';
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(String(docNumber).trim(), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
