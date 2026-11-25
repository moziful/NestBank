import { MongoClient } from 'mongodb';
import { DEFAULT_BANK_SETTINGS } from '../lib/bankSettings.js';

const uri = process.env.MONGODB_URI;

async function seedSettings() {
    try {
        console.log('Connecting to MongoDB for bankSettings seeding...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('nestbank');

        await db.collection('bankSettings').updateOne(
            { _id: 'active_config' },
            { $set: { _id: 'active_config', ...DEFAULT_BANK_SETTINGS } },
            { upsert: true }
        );

        console.log('Seeded active bankSettings successfully.');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Seed bankSettings error:', err);
        process.exit(1);
    }
}

seedSettings();
