import { NextResponse } from "next/server";
import { connectToDatabase } from "@/core/database/mongodb";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repoName = searchParams.get("repoName");
    const branchName = searchParams.get("branchName");

    const { db } = await connectToDatabase();

    const query: Record<string, any> = {};
    if (repoName) query.repoName = repoName;
    if (branchName) query.branchName = branchName;

    const pushLogs = await db
      .collection("github_push_history")
      .find(query)
      .sort({ pushedAt: -1 })
      .limit(50)
      .toArray();

    if (!pushLogs || pushLogs.length === 0) {
      return NextResponse.json({
        success: true,
        currentBranch: branchName || "main",
        totalCommits: 0,
        commits: [],
        changedFiles: [],
        message: "No pushes recorded in MongoDB yet.",
      });
    }

    const latestBranch = pushLogs[0]?.branchName || "main";

    const commits = pushLogs.map((log: any, idx: number) => ({
      shortHash: log.shortHash || "",
      fullHash: log.fullHash || "",
      subject: log.subject || "",
      author: log.author || "",
      relativeDate: log.pushedAt ? formatRelativeTime(new Date(log.pushedAt)) : "Just now",
      refs: idx === 0 ? `HEAD -> ${log.branchName || "main"}, origin/${log.branchName || "main"}` : "",
      repoUrl: log.repoUrl,
    }));

    return NextResponse.json({
      success: true,
      currentBranch: latestBranch,
      totalCommits: pushLogs.length,
      commits,
      changedFiles: [],
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      currentBranch: "main",
      totalCommits: 0,
      commits: [],
      changedFiles: [],
      error: err.message,
    });
  }
}
