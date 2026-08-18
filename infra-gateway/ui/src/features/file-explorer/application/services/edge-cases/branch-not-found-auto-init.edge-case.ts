export class BranchNotFoundAutoInitEdgeCase {
  public static async initializeBranchRef(
    authHeaders: Record<string, string>,
    owner: string,
    repo: string,
    targetBranch: string,
    baseCommitSha: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ref: `refs/heads/${targetBranch}`,
          sha: baseCommitSha,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
