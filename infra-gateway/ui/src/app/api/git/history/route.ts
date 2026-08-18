import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const cwd = process.cwd();

    const [logRes, countRes, statusRes, branchRes] = await Promise.all([
      execAsync('git log -n 50 --pretty=format:"%h|%H|%s|%an|%cr|%d"', { cwd }).catch(() => ({ stdout: "" })),
      execAsync("git rev-list --count HEAD", { cwd }).catch(() => ({ stdout: "0" })),
      execAsync("git status --short", { cwd }).catch(() => ({ stdout: "" })),
      execAsync("git branch --show-current", { cwd }).catch(() => ({ stdout: "main" })),
    ]);

    const commits = logRes.stdout
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const [shortHash, fullHash, subject, author, relativeDate, refs] = line.split("|");
        return {
          shortHash: shortHash || "",
          fullHash: fullHash || "",
          subject: subject || "",
          author: author || "",
          relativeDate: relativeDate || "",
          refs: refs ? refs.trim().replace(/^\((.*)\)$/, "$1") : "",
        };
      });

    const changedFiles = statusRes.stdout
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const code = line.substring(0, 2).trim();
        const file = line.substring(3).trim();
        return { status: code || "M", path: file };
      });

    const totalCommits = parseInt(countRes.stdout.trim(), 10) || commits.length;
    const currentBranch = branchRes.stdout.trim() || "main";

    return NextResponse.json({
      success: true,
      currentBranch,
      totalCommits,
      commits,
      changedFiles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch git history." },
      { status: 500 }
    );
  }
}
