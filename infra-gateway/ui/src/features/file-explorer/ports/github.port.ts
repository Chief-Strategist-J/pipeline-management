export interface GitHubPushPayload {
  token: string;
  repoName: string;
  commitMessage: string;
  isPrivate?: boolean;
}

export interface GitHubPushResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

export interface GitHubPort {
  pushToGitHub(payload: GitHubPushPayload): Promise<GitHubPushResult>;
}
