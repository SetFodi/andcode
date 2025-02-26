import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  ssl: true,
  tls: true,
  // Important for Render's Node environment
  tlsAllowInvalidCertificates: true, 
  useNewUrlParser: true,
  useUnifiedTopology: true
};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
    console.error("MongoDB connection failed:", err);
    throw err;
  });
}

export default clientPromise;