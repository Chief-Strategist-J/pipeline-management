import type { TreeItem } from "../domain/entities/file-node.entity";

export interface GitHubPushPayload {
  token: string;
  repoName: string;
  branchName?: string;
  commitMessage: string;
  isPrivate?: boolean;
  treeData?: TreeItem[];
}

export interface GitHubPushResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

export interface GitHubPort {
  pushToGitHub(payload: GitHubPushPayload): Promise<GitHubPushResult>;
}
