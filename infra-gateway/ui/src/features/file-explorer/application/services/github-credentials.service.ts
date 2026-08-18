import { connectToDatabase } from "@/core/database/mongodb";

export interface SaveTokenPayload {
  token: string;
  repoName: string;
  branchName: string;
  isPrivate?: boolean;
}

export interface ActiveTokenRecord {
  token: string;
  repoName: string;
  branchName: string;
  isPrivate: boolean;
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
  private static getPushHistoryCollectionName(): string {
    return process.env.NODE_ENV === "test" ? "github_push_history_test" : "github_push_history";
  }

  public static async getActiveToken(): Promise<ActiveTokenRecord | null> {
    try {
      const fetchTask = (async () => {
        const { db } = await connectToDatabase();
        const creds = await db.collection("github_credentials").findOne({ key: "active_token" });
        if (creds && creds.token) {
          return {
            token: creds.token,
            repoName: creds.repoName || "",
            branchName: creds.branchName || "main",
            isPrivate: !!creds.isPrivate,
          };
        }
        return null;
      })();

      const timeoutTask = new Promise<null>((resolve) => setTimeout(() => resolve(null), 300));
      return await Promise.race([fetchTask, timeoutTask]);
    } catch {
      return null;
    }
  }

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
      const colName = this.getPushHistoryCollectionName();
      await db.collection(colName).insertOne({
        ...entry,
        pushedAt: new Date(),
      });
    } catch {}
  }

  public static async purgeMockTestCommits(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      await db.collection("github_push_history").deleteMany({
        $or: [
          { author: { $in: ["testuser", "chief-strategist"] } },
          { shortHash: { $in: ["sha_e2e", "sha_new"] } },
        ],
      });
    } catch {}
  }
}
