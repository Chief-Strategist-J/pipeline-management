import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://root:example@localhost:27017/pipeline_management?authSource=admin";

const MONGODB_FALLBACK_URI = "mongodb://localhost:27017/pipeline_management";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 3000,
      serverSelectionTimeoutMS: 3000,
    });
    await client.connect();
    const db = client.db("pipeline_management");
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch {
    const fallbackClient = new MongoClient(MONGODB_FALLBACK_URI, {
      connectTimeoutMS: 3000,
      serverSelectionTimeoutMS: 3000,
    });
    await fallbackClient.connect();
    const db = fallbackClient.db("pipeline_management");
    cachedClient = fallbackClient;
    cachedDb = db;
    return { client: fallbackClient, db };
  }
}
