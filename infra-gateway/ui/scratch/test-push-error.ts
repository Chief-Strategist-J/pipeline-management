import { connectToDatabase } from "../src/core/database/mongodb";
import { GitHubPushService } from "../src/features/file-explorer/application/services/github-push.service";

async function runTestPush() {
  const { db } = await connectToDatabase();
  const creds = await db.collection("github_credentials").findOne({ key: "active_token" });

  if (!creds || !creds.token) {
    console.log("No credentials found in MongoDB.");
    process.exit(0);
  }

  console.log("Testing GitHubPushService with token:", creds.token.substring(0, 8) + "...");

  const response = await GitHubPushService.executePush({
    token: creds.token,
    repoName: creds.repoName || "test-repo",
    branchName: "main",
    commitMessage: "test: verify push pipeline execution",
    activeTemplateId: "nextjs-extreme-scale",
  });

  console.log("Response Status:", response.status);
  const data = await response.json();
  console.log("Response Body:", JSON.stringify(data, null, 2));
}

runTestPush().catch(console.error);
