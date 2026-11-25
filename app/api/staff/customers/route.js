import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getSession, hasRole, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { createAuditLog } from '@/lib/audit';
import { normalizeBDPhone, validateFullRegistration } from '@/lib/customerValidation';
import { encryptDocumentNumber, hashDocumentNumber } from '@/lib/cryptoUtils';

// POST /api/staff/customers - Register a new customer profile (no auto bank account or deposit)
export async function POST(request) {
    try {
        const session = await getSession(request);
        if (!session || !hasRole(session, ['Admin', 'Bank Staff'])) {
            return NextResponse.json({ success: false, message: 'Forbidden: Staff or Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            personalInfo = {},
            contactInfo = {},
            addresses = {},
            identity = {},
            employment = {},
            nominee = {},
            internalNotes = '',
            draftId = null,
            confirmedAccurate = false,
        } = body;

        if (!confirmedAccurate) {
            return NextResponse.json(
                { success: false, message: 'Please confirm that all customer details were reviewed accurately.' },
                { status: 400 }
            );
        }

        // 1. Server-side field validation
        const validation = validateFullRegistration({ personalInfo, contactInfo, addresses, identity, employment });
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed. Please check highlighted fields.',
                    errors: validation.errors,
                },
                { status: 400 }
            );
        }

        const db = await getDb();

        // 2. Normalize values & hash identity document
        const normalizedMobile = normalizeBDPhone(contactInfo.mobile).normalized;
        const normalizedAltPhone = contactInfo.alternatePhone ? normalizeBDPhone(contactInfo.alternatePhone).normalized : '';
        const normalizedEmail = (contactInfo.email || '').trim().toLowerCase();
        const docNumberHash = hashDocumentNumber(identity.documentNumber);
        const docNumberEncrypted = encryptDocumentNumber(identity.documentNumber);

        // 3. Enforce duplicate customer detection
        const duplicateUserQuery = [{ phone: normalizedMobile }];
        if (normalizedEmail) duplicateUserQuery.push({ email: normalizedEmail });

        const existingUser = await db.collection('users').findOne({
            role: 'Customer',
            $or: duplicateUserQuery,
        });

        const duplicateProfileQuery = [
            { 'identity.documentNumberHash': docHashOrNull(docNumberHash) },
            { 'contactInfo.mobile': normalizedMobile },
        ];
        if (normalizedEmail) duplicateProfileQuery.push({ 'contactInfo.email': normalizedEmail });

        const existingProfile = await db.collection('customerProfiles').findOne({
            $or: duplicateProfileQuery,
        });

        if (existingUser || existingProfile) {
            const matchedId = existingProfile?.customerId || existingUser?.customerId || 'EXISTING';
            return NextResponse.json(
                {
                    success: false,
                    code: 'DUPLICATE_CUSTOMER',
                    message: `A customer record with matching mobile, email, or identity document already exists (${matchedId}).`,
                    match: {
                        customerId: matchedId,
                        id: String(existingProfile?.userId || existingUser?._id || ''),
                    },
                },
                { status: 409 }
            );
        }

        // 4. Generate unique Customer ID: CUS-YYYY-XXXXX
        const year = new Date().getFullYear();
        const randNum = Math.floor(10000 + Math.random() * 90000);
        const customerId = `CUS-${year}-${randNum}`;

        const fullName = [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName]
            .map((s) => (s || '').trim())
            .filter(Boolean)
            .join(' ');

        const baseUsername = `${personalInfo.firstName}${personalInfo.lastName}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 14) || 'customer';
        const username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

        // Temporary random password hash (user activates portal credentials later)
        const tempRandomPass = crypto.randomBytes(12).toString('hex');
        const hashedPassword = await hashPassword(tempRandomPass);

        const now = new Date();
        const presentAddress = {
            division: addresses.present?.division || '',
            district: (addresses.present?.district || '').trim(),
            upazila: (addresses.present?.upazila || '').trim(),
            postOffice: (addresses.present?.postOffice || '').trim(),
            postalCode: (addresses.present?.postalCode || '').trim(),
            addressLine: (addresses.present?.addressLine || '').trim(),
        };
        const permanentAddress = addresses.sameAsPresent
            ? { ...presentAddress }
            : {
                division: addresses.permanent?.division || '',
                district: (addresses.permanent?.district || '').trim(),
                upazila: (addresses.permanent?.upazila || '').trim(),
                postOffice: (addresses.permanent?.postOffice || '').trim(),
                postalCode: (addresses.permanent?.postalCode || '').trim(),
                addressLine: (addresses.permanent?.addressLine || '').trim(),
            };

        const monthlyIncomeBDT = employment.monthlyIncome ? Number(employment.monthlyIncome) : 0;
        const monthlyIncomePoisha = Math.round(monthlyIncomeBDT * 100);

        // 5. Create User record (status Pending, NO bank account created)
        const newUserDoc = {
            name: fullName,
            username,
            email: normalizedEmail || `${username}@pending.nestbank.local`,
            phone: normalizedMobile,
            customerId,
            address: `${presentAddress.addressLine}, ${presentAddress.district}`,
            dateOfBirth: personalInfo.dateOfBirth,
            password: hashedPassword,
            role: 'Customer',
            status: 'Pending',
            verificationStatus: 'PENDING',
            createdBy: session.userId,
            metadata: {
                registeredBy: session.userId,
                registeredByName: session.name || session.username,
                source: 'STAFF',
            },
            createdAt: now,
            updatedAt: now,
        };

        const userResult = await db.collection('users').insertOne(newUserDoc);
        const userId = userResult.insertedId;

        // 6. Store secure document metadata in customerDocuments (private storage references)
        const documentRefs = [];
        const docEntries = [
            { side: 'FRONT', doc: identity.frontDocument },
            { side: 'BACK', doc: identity.backDocument },
        ];

        for (const entry of docEntries) {
            if (entry.doc && entry.doc.name) {
                const docRecord = {
                    customerId,
                    userId,
                    documentType: identity.documentType,
                    side: entry.side,
                    fileName: entry.doc.name,
                    mimeType: entry.doc.type || 'application/octet-stream',
                    sizeBytes: entry.doc.size || 0,
                    // Private data reference (never exposed as public URL)
                    storageRef: `private://kyc/${customerId}/${entry.side.toLowerCase()}-${Date.now()}`,
                    previewData: entry.doc.dataUrl || null,
                    uploadedBy: session.userId,
                    uploadedAt: now,
                };
                const docRes = await db.collection('customerDocuments').insertOne(docRecord);
                documentRefs.push({
                    documentId: String(docRes.insertedId),
                    side: entry.side,
                    fileName: entry.doc.name,
                    mimeType: entry.doc.type,
                    sizeBytes: entry.doc.size,
                    uploadedAt: now,
                });
            }
        }

        // 7. Create CustomerProfile document
        const customerProfileDoc = {
            customerId,
            userId,
            personalInfo: {
                firstName: personalInfo.firstName.trim(),
                middleName: (personalInfo.middleName || '').trim(),
                lastName: personalInfo.lastName.trim(),
                dateOfBirth: new Date(personalInfo.dateOfBirth),
                gender: personalInfo.gender,
                nationality: personalInfo.nationality.trim(),
                occupation: (personalInfo.occupation || '').trim(),
                maritalStatus: personalInfo.maritalStatus || '',
                photoUrl: personalInfo.photoDataUrl || '',
            },
            contactInfo: {
                mobile: normalizedMobile,
                alternatePhone: normalizedAltPhone,
                email: normalizedEmail,
            },
            addresses: {
                present: presentAddress,
                permanent: permanentAddress,
                sameAsPresent: Boolean(addresses.sameAsPresent),
            },
            identity: {
                documentType: identity.documentType,
                documentNumberEncrypted: docNumberEncrypted,
                documentNumberHash: docNumberHash,
                issueDate: identity.issueDate || null,
                expiryDate: identity.expiryDate || null,
                verificationStatus: 'PENDING',
                documents: documentRefs,
            },
            employment: {
                status: employment.status || '',
                employer: (employment.employer || '').trim(),
                designation: (employment.designation || '').trim(),
                monthlyIncomePoisha,
                monthlyIncomeBDT,
                incomeSource: employment.incomeSource || '',
                workAddress: (employment.workAddress || '').trim(),
            },
            nominee: nominee.fullName
                ? {
                    fullName: nominee.fullName.trim(),
                    relationship: nominee.relationship || '',
                    dateOfBirth: nominee.dateOfBirth || null,
                    contactNumber: nominee.contactNumber ? normalizeBDPhone(nominee.contactNumber).normalized : '',
                    identityNumberEncrypted: nominee.identityNumber ? encryptDocumentNumber(nominee.identityNumber) : '',
                    address: (nominee.address || '').trim(),
                }
                : null,
            internalNotes: (internalNotes || '').trim(),
            registration: {
                registeredBy: session.userId,
                registeredByName: session.name || session.username,
                registeredAt: now,
                source: 'STAFF',
            },
            status: 'PENDING',
            createdAt: now,
            updatedAt: now,
        };

        await db.collection('customerProfiles').insertOne(customerProfileDoc);

        // 8. Clean up draft if submitted from a saved draft
        if (draftId && ObjectId.isValid(draftId)) {
            await db.collection('customerDrafts').deleteOne({ _id: new ObjectId(draftId) });
        }

        // 9. Audit Log (never log passwords or full NID)
        await createAuditLog({
            actorId: session.userId,
            actorName: session.name || session.username,
            actorRole: session.role,
            action: 'STAFF_REGISTER_CUSTOMER',
            category: 'CUSTOMER',
            targetType: 'User',
            targetId: String(userId),
            description: `Staff registered customer profile ${customerId} (${fullName}) with verification status PENDING`,
            changes: {
                before: null,
                after: {
                    customerId,
                    status: 'PENDING',
                    verificationStatus: 'PENDING',
                    documentType: identity.documentType,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Customer registered successfully. Identity verification is pending.',
            result: {
                userId: String(userId),
                customerId,
                fullName,
                registrationStatus: 'Registered',
                profileStatus: 'PENDING',
                verificationStatus: 'PENDING',
                registeredBy: session.name || session.username,
                registeredAt: now,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Staff register customer error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

function docHashOrNull(hash) {
    return hash || '__NEVER_MATCH__';
}
