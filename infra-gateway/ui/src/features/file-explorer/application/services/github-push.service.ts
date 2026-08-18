/**
 * ALGORITHM: GITHUB CODE SYNC & DATABASE DUAL-PERSISTENCE ORCHESTRATOR
 * ============================================================================
 * 1. PRECONDITION RULE VALIDATION:
 *    - Evaluates `GitHubPushRulesEngine` for token and repository input validity.
 * 
 * 2. PAT TOKEN MONGODB PERSISTENCE:
 *    - Calls `GitHubCredentialsService.saveActiveToken()` to persist credentials in MongoDB `github_credentials`.
 * 
 * 3. AUTHENTICATION & OWNER PARSING:
 *    - Verifies GitHub PAT via `/user` API and resolves repository owner (`owner/repo`).
 * 
 * 4. DATA-DRIVEN TREE FLATTENING:
 *    - Calls `TreeFlatteningService.resolveTreeDataWithFallback()` to extract flat file additions.
 * 
 * 5. GITHUB GRAPHQL API v4 PIPELINE:
 *    - Calls `GitHubGraphQLService.executePushPipeline()` executing `createCommitOnBranch` mutation.
 * 
 * 6. REST GIT DATA FALLBACK:
 *    - Falls back to `GitHubRestFallbackService.executePushPipeline()` if GraphQL branch target requires initialization.
 * 
 * 7. PUSH HISTORY MONGODB LOGGING:
 *    - Logs push commit record (SHA, branch, file count, timestamp) into MongoDB `github_push_history`.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { TreeFlatteningService } from "./tree-flattening.service";
import { GitHubCredentialsService } from "./github-credentials.service";
import { GitHubPushRulesEngine } from "../../rules/github-push-rules.engine";
import { GitHubGraphQLService } from "./github-graphql.service";
import { GitHubRestFallbackService } from "./github-rest-fallback.service";
import { GitHubErrorRegistry } from "./github-error.registry";

export interface PushRequestDto {
  token: string;
  repoName: string;
  branchName?: string;
  commitMessage?: string;
  isPrivate?: boolean;
  treeData?: any[];
}

export class GitHubPushService {
  public static async executePush(body: PushRequestDto): Promise<NextResponse> {
    const ruleResult = GitHubPushRulesEngine.validateRequest({
      token: body.token,
      repoName: body.repoName,
      branchName: body.branchName,
    });

    if (!ruleResult.isValid) {
      return GitHubErrorRegistry.handle(ruleResult.errorCode!, ruleResult.errorMessage!);
    }

    const cleanToken = body.token.trim();
    const targetBranch = (body.branchName || "main").trim();
    const commitMsg = body.commitMessage || "feat: sync template code tree from OpenVSCode IDE";
    const isPrivate = !!body.isPrivate;

    await GitHubCredentialsService.saveActiveToken({
      token: cleanToken,
      repoName: body.repoName.trim(),
      branchName: targetBranch,
      isPrivate,
    });

    const authHeaders = {
      Authorization: `bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Pipeline-Management-IDE",
    };

    const userRes = await fetch("https://api.github.com/user", { headers: authHeaders });
    if (!userRes.ok) {
      const errText = await userRes.text();
      return GitHubErrorRegistry.handle("UNAUTHORIZED", `Invalid GitHub Token: ${userRes.status} ${errText}`);
    }

    const userData = await userRes.json();
    const authenticatedUser = userData.login;

    const { owner, actualRepo } = GitHubPushRulesEngine.parseOwnerRepo(body.repoName, authenticatedUser);
    const filesToCommit = TreeFlatteningService.resolveTreeDataWithFallback(body.treeData || []);

    const gqlResult = await GitHubGraphQLService.executePushPipeline({
      authHeaders,
      owner,
      repo: actualRepo,
      branch: targetBranch,
      commitMessage: commitMsg,
      authenticatedUser,
      isPrivate,
      filesToCommit,
    });

    if (gqlResult.success && gqlResult.shortHash && gqlResult.fullHash && gqlResult.repoUrl) {
      await GitHubCredentialsService.recordPushCommit({
        shortHash: gqlResult.shortHash,
        fullHash: gqlResult.fullHash,
        subject: commitMsg,
        author: authenticatedUser,
        repoUrl: gqlResult.repoUrl,
        repoName: `${owner}/${actualRepo}`,
        branchName: targetBranch,
        fileCount: filesToCommit.length,
      });

      return NextResponse.json({
        success: true,
        repoUrl: gqlResult.repoUrl,
        message: `GitHub GraphQL API v4: Committed and pushed all ${filesToCommit.length} workspace files to branch '${targetBranch}' (Commit SHA: ${gqlResult.shortHash}).`,
      });
    }

    const restResult = await GitHubRestFallbackService.executePushPipeline({
      authHeaders,
      owner,
      repo: actualRepo,
      branch: targetBranch,
      commitMessage: commitMsg,
      authenticatedUser,
      isPrivate,
      filesToCommit,
    });

    if (!restResult.success) {
      return GitHubErrorRegistry.handle("GITHUB_API_ERROR", restResult.error || "Failed to push to GitHub.");
    }

    await GitHubCredentialsService.recordPushCommit({
      shortHash: restResult.shortHash!,
      fullHash: restResult.fullHash!,
      subject: commitMsg,
      author: authenticatedUser,
      repoUrl: restResult.repoUrl!,
      repoName: `${owner}/${actualRepo}`,
      branchName: targetBranch,
      fileCount: filesToCommit.length,
    });

    const actionText = restResult.repoCreated
      ? `Repository '${actualRepo}' created on GitHub.`
      : `Synchronized with existing repository '${actualRepo}'.`;

    return NextResponse.json({
      success: true,
      repoUrl: restResult.repoUrl,
      message: `${actionText} Committed and pushed all ${filesToCommit.length} workspace files to branch '${targetBranch}' (Commit SHA: ${restResult.shortHash}).`,
    });
  }
}
