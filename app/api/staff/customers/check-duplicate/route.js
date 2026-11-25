import { NextResponse } from 'next/server';
import { getSession, hasRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { normalizeBDPhone } from '@/lib/customerValidation';
import { hashDocumentNumber } from '@/lib/cryptoUtils';

// GET /api/staff/customers/check-duplicate?mobile=...&email=...&documentNumber=...
export async function GET(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const mobile = (searchParams.get('mobile') || '').trim();
        const email = (searchParams.get('email') || '').trim().toLowerCase();
        const documentNumber = (searchParams.get('documentNumber') || '').trim();

        const db = await getDb();
        const orConditionsUser = [];
        const orConditionsProfile = [];

        if (mobile) {
            const phoneCheck = normalizeBDPhone(mobile);
            const normalized = phoneCheck.normalized;
            const variants = Array.from(new Set([
                mobile,
                normalized,
                normalized.startsWith('0') ? `+88${normalized}` : normalized,
                normalized.startsWith('0') ? `88${normalized}` : normalized,
            ]));
            orConditionsUser.push({ phone: { $in: variants } });
            orConditionsProfile.push({ 'contactInfo.mobile': { $in: variants } });
        }

        if (email) {
            orConditionsUser.push({ email });
            orConditionsProfile.push({ 'contactInfo.email': email });
        }

        let docHash = '';
        if (documentNumber && documentNumber.length >= 5) {
            docHash = hashDocumentNumber(documentNumber);
            orConditionsProfile.push({ 'identity.documentNumberHash': docHash });
        }

        if (orConditionsUser.length === 0 && orConditionsProfile.length === 0) {
            return NextResponse.json({ success: true, duplicateFound: false, matches: [] });
        }

        const matchedMap = new Map();

        if (orConditionsProfile.length > 0) {
            const profiles = await db.collection('customerProfiles')
                .find({ $or: orConditionsProfile })
                .limit(5)
                .toArray();

            for (const p of profiles) {
                const matchTypes = [];
                if (docHash && p.identity?.documentNumberHash === docHash) matchTypes.push('Identity Document');
                if (mobile && p.contactInfo?.mobile) {
                    const pNorm = normalizeBDPhone(p.contactInfo.mobile).normalized;
                    const qNorm = normalizeBDPhone(mobile).normalized;
                    if (pNorm === qNorm) matchTypes.push('Mobile Number');
                }
                if (email && p.contactInfo?.email?.toLowerCase() === email) matchTypes.push('Email Address');

                matchedMap.set(p.customerId || String(p._id), {
                    id: String(p.userId || p._id),
                    customerId: p.customerId || 'N/A',
                    name: `${p.personalInfo?.firstName || ''} ${p.personalInfo?.lastName || ''}`.trim() || 'Existing Customer',
                    status: p.status || 'ACTIVE',
                    matchTypes: matchTypes.length ? matchTypes : ['Record Match'],
                });
            }
        }

        if (orConditionsUser.length > 0) {
            const users = await db.collection('users')
                .find({ role: 'Customer', $or: orConditionsUser }, { projection: { password: 0, transactionPin: 0 } })
                .limit(5)
                .toArray();

            for (const u of users) {
                const key = u.customerId || String(u._id);
                if (!matchedMap.has(key)) {
                    const matchTypes = [];
                    if (mobile && u.phone) {
                        const uNorm = normalizeBDPhone(u.phone).normalized;
                        const qNorm = normalizeBDPhone(mobile).normalized;
                        if (uNorm === qNorm) matchTypes.push('Mobile Number');
                    }
                    if (email && u.email?.toLowerCase() === email) matchTypes.push('Email Address');

                    matchedMap.set(key, {
                        id: String(u._id),
                        customerId: u.customerId || String(u._id).slice(-8).toUpperCase(),
                        name: u.name || 'Existing Customer',
                        status: u.status || 'Active',
                        matchTypes: matchTypes.length ? matchTypes : ['Record Match'],
                    });
                }
            }
        }

        const matches = Array.from(matchedMap.values());
        return NextResponse.json({
            success: true,
            duplicateFound: matches.length > 0,
            matches,
        });
    } catch (error) {
        console.error('Duplicate check error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
