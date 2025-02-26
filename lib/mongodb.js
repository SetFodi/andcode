// lib/mongodb-alt.js
import { MongoClient } from 'mongodb';

// Cache the MongoDB connection to reuse across requests
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // If the connection is already established, return the cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  // Setting multiple connection options to bypass SSL issues on Render
  const options = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsInsecure: true,  // This should help with SSL issues
    retryWrites: false,  // Turn off retryWrites if having issues
    minPoolSize: 1, 
    maxPoolSize: 10
  };

  try {
    // Connect to MongoDB
    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db('leetcode-clone');
    
    console.log('Successfully connected to MongoDB');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}