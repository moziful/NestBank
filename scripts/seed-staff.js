import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

async function seedStaffData() {
    try {
        console.log('Connecting to MongoDB to seed staff data...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        const salt = await bcrypt.genSalt(10);
        const defaultHash = await bcrypt.hash('StaffPass123!', salt);

        const staffMembers = [
            {
                name: 'Rahim Ahmed',
                username: 'rahim.ahmed',
                email: 'rahim@bankdemo.com',
                phone: '+880 1711 000101',
                employeeId: 'STF-1001',
                department: 'Customer Service',
                designation: 'Senior Banking Officer',
                role: 'Bank Staff',
                status: 'Active',
                password: defaultHash,
                joiningDate: new Date('2024-03-15'),
                lastLogin: new Date(Date.now() - 3600000 * 2),
                createdAt: new Date('2024-03-15'),
                updatedAt: new Date(),
            },
            {
                name: 'Nusrat Jahan',
                username: 'nusrat.jahan',
                email: 'nusrat@bankdemo.com',
                phone: '+880 1812 000102',
                employeeId: 'STF-1002',
                department: 'Loan Department',
                designation: 'Credit Assessment Officer',
                role: 'Bank Staff',
                status: 'Active',
                password: defaultHash,
                joiningDate: new Date('2024-06-01'),
                lastLogin: new Date(Date.now() - 3600000 * 5),
                createdAt: new Date('2024-06-01'),
                updatedAt: new Date(),
            },
            {
                name: 'Karim Hasan',
                username: 'karim.hasan',
                email: 'karim@bankdemo.com',
                phone: '+880 1913 000103',
                employeeId: 'STF-1003',
                department: 'Account Operations',
                designation: 'Operations Specialist',
                role: 'Bank Staff',
                status: 'Inactive',
                password: defaultHash,
                joiningDate: new Date('2023-11-20'),
                lastLogin: new Date(Date.now() - 86400000 * 4),
                createdAt: new Date('2023-11-20'),
                updatedAt: new Date(),
            },
            {
                name: 'Sabrina Mostafa',
                username: 'sabrina.m',
                email: 'sabrina@bankdemo.com',
                phone: '+880 1614 000104',
                employeeId: 'STF-1004',
                department: 'Transaction Operations',
                designation: 'Clearing Supervisor',
                role: 'Bank Staff',
                status: 'Active',
                password: defaultHash,
                joiningDate: new Date('2025-01-10'),
                lastLogin: new Date(Date.now() - 3600000 * 1),
                createdAt: new Date('2025-01-10'),
                updatedAt: new Date(),
            },
            {
                name: 'Tanvir Mahmud',
                username: 'tanvir.m',
                email: 'tanvir@bankdemo.com',
                phone: '+880 1515 000105',
                employeeId: 'STF-1005',
                department: 'Compliance',
                designation: 'AML Analyst',
                role: 'Bank Staff',
                status: 'Suspended',
                password: defaultHash,
                joiningDate: new Date('2024-09-01'),
                lastLogin: new Date(Date.now() - 86400000 * 12),
                createdAt: new Date('2024-09-01'),
                updatedAt: new Date(),
            },
            {
                name: 'Ayesha Siddiqua',
                username: 'ayesha.s',
                email: 'ayesha@bankdemo.com',
                phone: '+880 1716 000106',
                employeeId: 'STF-1006',
                department: 'General Administration',
                designation: 'Branch Executive',
                role: 'Bank Staff',
                status: 'Active',
                password: defaultHash,
                joiningDate: new Date(), // this month
                lastLogin: new Date(Date.now() - 3600000 * 8),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        for (const staff of staffMembers) {
            const existing = await db.collection('users').findOne({ email: staff.email });
            if (!existing) {
                const inserted = await db.collection('users').insertOne(staff);
                console.log(`Inserted staff: ${staff.name} (${staff.employeeId})`);

                // Insert specific audit activity
                await db.collection('auditLogs').insertOne({
                    actorId: inserted.insertedId.toString(),
                    actor: staff.name,
                    action: 'STAFF_ONBOARDED',
                    event: `Staff account provisioned: ${staff.name} as ${staff.designation}`,
                    recordRef: staff.employeeId,
                    severity: 'Info',
                    createdAt: staff.joiningDate,
                });
            } else {
                // Update employeeId, department, designation if missing
                await db.collection('users').updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            employeeId: existing.employeeId || staff.employeeId,
                            department: existing.department || staff.department,
                            designation: existing.designation || staff.designation,
                            joiningDate: existing.joiningDate || staff.joiningDate,
                            lastLogin: existing.lastLogin || staff.lastLogin,
                        }
                    }
                );
            }
        }

        // Add real-time recent staff activity logs
        const sampleStaffActivities = [
            { actor: 'Rahim Ahmed', action: 'REGISTER_CUSTOMER', event: 'Registered customer Farhana Ahmed and opened Savings account', recordRef: 'NB1002938477', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 18) },
            { actor: 'Nusrat Jahan', action: 'LOAN_ASSESSMENT', event: 'Forwarded loan application LN-2026-002 for credit committee review', recordRef: 'LN-2026-002', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 42) },
            { actor: 'Rahim Ahmed', action: 'CREATE_ACCOUNT', event: 'Created corporate checking account for Apex Trade Corp', recordRef: 'NB1002938473', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 65) },
            { actor: 'Sabrina Mostafa', action: 'PROCESS_TRANSACTION', event: 'Settled clearing batch #4928 involving 12 interbank transfers', recordRef: 'TXN-SETTLE-4928', severity: 'Info', createdAt: new Date(Date.now() - 1000 * 60 * 110) },
            { actor: 'System Admin', action: 'DEACTIVATE_STAFF', event: 'Account for Karim Hasan deactivated pending departmental rotation', recordRef: 'STF-1003', severity: 'Warning', createdAt: new Date(Date.now() - 86400000) },
        ];

        for (const act of sampleStaffActivities) {
            await db.collection('auditLogs').insertOne(act);
        }

        console.log('Staff members and activities seeded successfully!');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding staff data:', err);
        process.exit(1);
    }
}

seedStaffData();
