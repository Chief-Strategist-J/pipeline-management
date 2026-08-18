export interface PushRequestContext {
  token?: string;
  repoName?: string;
  branchName?: string;
  filesToCommitCount?: number;
}

export interface RuleValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export class GitHubPushRulesEngine {
  public static validateRequest(ctx: PushRequestContext): RuleValidationResult {
    if (!ctx.token || !ctx.token.trim()) {
      return {
        isValid: false,
        errorCode: "UNAUTHORIZED",
        errorMessage: "GitHub Personal Access Token (PAT) is missing.",
      };
    }

    if (!ctx.repoName || !ctx.repoName.trim()) {
      return {
        isValid: false,
        errorCode: "BAD_REQUEST",
        errorMessage: "Repository name is required.",
      };
    }

    return { isValid: true };
  }

  public static parseOwnerRepo(inputRepoName: string, defaultUser: string): { owner: string; actualRepo: string } {
    const trimmed = inputRepoName.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      return { owner: parts[0], actualRepo: parts[1] };
    }
    return { owner: defaultUser, actualRepo: trimmed };
  }
}
