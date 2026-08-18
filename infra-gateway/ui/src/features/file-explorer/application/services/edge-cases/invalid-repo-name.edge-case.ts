import type { EdgeCaseResult } from "./empty-token.edge-case";

export class InvalidRepoNameEdgeCase {
  public static handle(repoName?: string): EdgeCaseResult {
    if (!repoName || !repoName.trim()) {
      return {
        triggered: true,
        errorCode: "BAD_REQUEST",
        errorMessage: "Repository name is required and cannot be empty.",
      };
    }

    const cleaned = repoName.trim();
    if (/[@#$%^&*()+\=\[\]{};':"\\|,<>?]+/.test(cleaned)) {
      return {
        triggered: true,
        errorCode: "BAD_REQUEST",
        errorMessage: "Repository name contains invalid special characters.",
      };
    }

    return { triggered: false };
  }
}
