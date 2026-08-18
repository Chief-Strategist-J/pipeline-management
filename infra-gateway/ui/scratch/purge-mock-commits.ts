import { connectToDatabase } from "../src/core/database/mongodb";

async function purge() {
  const { db } = await connectToDatabase();
  const res = await db.collection("github_push_history").deleteMany({
    $or: [
      { author: { $in: ["testuser", "chief-strategist"] } },
      { shortHash: { $in: ["sha_e2e", "sha_new"] } },
    ],
  });
  console.log("Purged mock test records from MongoDB:", res.deletedCount);
}

purge().catch(console.error);
