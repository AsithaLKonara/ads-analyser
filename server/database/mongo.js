const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = uri ? new MongoClient(uri) : null;

let db;

async function connectToMongo() {
    if (!client) {
        console.warn('MongoDB URI not configured. Data persistence is disabled.');
        return null;
    }
    try {
        if (db) return db;
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        db = client.db('ads_analyzer');
        return db;
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        return null;
    }
}

async function saveAds(ads, keyword) {
    const mongoDb = await connectToMongo();
    if (!mongoDb) return;
    
    const collection = mongoDb.collection('scraped_ads');
    const ops = ads.map(ad => ({
        updateOne: {
            filter: { id: ad.id },
            update: { $set: { ...ad, keyword, updatedAt: new Date() } },
            upsert: true
        }
    }));
    
    if (ops.length > 0) {
        await collection.bulkWrite(ops);
    }
}

async function getTrends() {
    const mongoDb = await connectToMongo();
    if (!mongoDb) return [];
    
    const collection = mongoDb.collection('scraped_ads');
    return await collection.find().sort({ updatedAt: -1 }).limit(100).toArray();
}

module.exports = { connectToMongo, saveAds, getTrends };
