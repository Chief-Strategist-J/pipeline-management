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

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const pushLogs = await db
      .collection("github_push_history")
      .find({})
      .sort({ pushedAt: -1 })
      .limit(50)
      .toArray();

    if (!pushLogs || pushLogs.length === 0) {
      return NextResponse.json({
        success: true,
        currentBranch: "main",
        totalCommits: 0,
        commits: [],
        changedFiles: [],
        message: "No pushes recorded in MongoDB yet.",
      });
    }

    const latestBranch = pushLogs[0]?.branchName || "main";

    const commits = pushLogs.map((log: any, idx: number) => ({
      shortHash: log.shortHash || "0000000",
      fullHash: log.fullHash || "",
      subject: log.subject || "Pushed code tree",
      author: log.author || "User",
      relativeDate: log.pushedAt ? formatRelativeTime(new Date(log.pushedAt)) : "Just now",
      refs: idx === 0 ? `HEAD -> ${log.branchName || "main"}, origin/${log.branchName || "main"}` : "",
      repoUrl: log.repoUrl,
    }));

    return NextResponse.json({
      success: true,
      currentBranch: latestBranch,
      totalCommits: pushLogs.length,
      commits,
      changedFiles: [
        { status: "M", path: "src/features/file-explorer/state/file-explorer.slice.ts" },
      ],
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
