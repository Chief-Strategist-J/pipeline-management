import type { EdgeCaseResult } from "./empty-token.edge-case";

export class RateLimitEdgeCase {
  public static handle(status: number, errorText: string): EdgeCaseResult {
    if (status === 429 || status === 403 && errorText.toLowerCase().includes("rate limit")) {
      return {
        triggered: true,
        errorCode: "GITHUB_API_ERROR",
        errorMessage: "GitHub API rate limit exceeded. Please wait a few minutes before retrying your push.",
      };
    }
    return { triggered: false };
  }
}
