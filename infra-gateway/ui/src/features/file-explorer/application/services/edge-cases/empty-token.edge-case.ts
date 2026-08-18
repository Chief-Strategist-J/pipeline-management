export interface EdgeCaseResult {
  triggered: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export class EmptyTokenEdgeCase {
  public static handle(token?: string): EdgeCaseResult {
    if (!token || !token.trim()) {
      return {
        triggered: true,
        errorCode: "UNAUTHORIZED",
        errorMessage: "GitHub Personal Access Token (PAT) is missing or empty.",
      };
    }
    return { triggered: false };
  }
}
