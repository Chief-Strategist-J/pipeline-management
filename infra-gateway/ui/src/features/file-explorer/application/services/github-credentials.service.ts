import { connectToDatabase } from "@/core/database/mongodb";

export interface SaveTokenPayload {
  token: string;
  repoName: string;
  branchName: string;
  isPrivate?: boolean;
}

export interface PushHistoryEntry {
  shortHash: string;
  fullHash: string;
  subject: string;
  author: string;
  repoUrl: string;
  repoName: string;
  branchName: string;
  fileCount: number;
}

export class GitHubCredentialsService {
  public static async saveActiveToken(payload: SaveTokenPayload): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      await db.collection("github_credentials").updateOne(
        { key: "active_token" },
        {
          $set: {
            key: "active_token",
            token: payload.token,
            repoName: payload.repoName,
            branchName: payload.branchName,
            isPrivate: !!payload.isPrivate,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch {}
  }

  public static async recordPushCommit(entry: PushHistoryEntry): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      await db.collection("github_push_history").insertOne({
        ...entry,
        pushedAt: new Date(),
      });
    } catch {}
  }
}
