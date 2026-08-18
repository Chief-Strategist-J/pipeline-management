import type { EdgeCaseResult } from "./empty-token.edge-case";

export class ExpiredTokenEdgeCase {
  public static handle(status: number, errorText: string): EdgeCaseResult {
    if (status === 401 || errorText.toLowerCase().includes("bad credentials")) {
      return {
        triggered: true,
        errorCode: "UNAUTHORIZED",
        errorMessage: "GitHub Personal Access Token is expired, invalid, or lacks required 'repo' OAuth scopes.",
      };
    }
    return { triggered: false };
  }
}
