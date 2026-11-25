import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
async function check() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('nestbank');

  const sample = await db.collection('transactions').find({}).limit(5).toArray();
  for (const s of sample) {
    console.log(s.transactionId, 'createdAt:', s.createdAt, typeof s.createdAt, s.createdAt instanceof Date);
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const volumeAgg = await db.collection('transactions').aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        volume: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();

  console.log('volumeAgg length:', volumeAgg.length);
  console.log('volumeAgg items:', volumeAgg);

  await client.close();
}

check();
