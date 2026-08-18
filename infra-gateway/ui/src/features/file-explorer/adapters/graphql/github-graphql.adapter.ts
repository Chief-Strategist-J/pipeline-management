import type { GitHubPort, GitHubPushPayload, GitHubPushResult } from "../../ports/github.port";

export class GitHubGraphQLAdapter implements GitHubPort {
  async pushToGitHub(payload: GitHubPushPayload): Promise<GitHubPushResult> {
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || data.message || "Failed to push to GitHub repository via GraphQL API.",
        };
      }
      return {
        success: true,
        repoUrl: data.repoUrl,
        message: data.message || `Successfully created repository and committed code via GitHub GraphQL API.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to GitHub GraphQL push service.",
      };
    }
  }
}
