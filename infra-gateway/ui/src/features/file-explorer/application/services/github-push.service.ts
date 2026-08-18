/**
 * ALGORITHM: GITHUB CODE SYNC & DATABASE DUAL-PERSISTENCE ORCHESTRATOR
 * ============================================================================
 * 1. AUTOMATIC MONGODB PAT TOKEN FALLBACK:
 *    - If `body.token` or `body.repoName` are completely empty, resolves saved credentials from MongoDB `github_credentials`.
 * 
 * 2. PRECONDITION RULE VALIDATION:
 *    - Evaluates `GitHubPushRulesEngine` for token and repository input validity.
 * 
 * 3. PAT TOKEN MONGODB PERSISTENCE:
 *    - Saves/updates PAT token record in MongoDB `github_credentials`.
 * 
 * 4. AUTHENTICATION & OWNER PARSING:
 *    - Verifies GitHub PAT via `/user` API and resolves repository owner (`owner/repo`).
 * 
 * 5. DATA-DRIVEN TREE FLATTENING:
 *    - Calls `TreeFlatteningService.resolveTreeDataWithFallback()` to extract flat file additions.
 * 
 * 6. GITHUB GRAPHQL API v4 PIPELINE:
 *    - Calls `GitHubGraphQLService.executePushPipeline()` executing `createCommitOnBranch` mutation.
 * 
 * 7. REST GIT DATA FALLBACK:
 *    - Falls back to `GitHubRestFallbackService.executePushPipeline()` if GraphQL branch target requires initialization.
 * 
 * 8. PUSH HISTORY MONGODB LOGGING:
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
  token?: string;
  repoName?: string;
  branchName?: string;
  commitMessage?: string;
  isPrivate?: boolean;
  activeTemplateId?: string;
  treeData?: any[];
}

export class GitHubPushService {
  public static async executePush(body: PushRequestDto): Promise<NextResponse> {
    let activeToken = (body.token || "").trim();
    let targetRepo = (body.repoName || "").trim();
    let targetBranch = (body.branchName || "main").trim();
    let isPrivate = !!body.isPrivate;

    if (!activeToken && !targetRepo) {
      const mongoRecord = await GitHubCredentialsService.getActiveToken();
      if (mongoRecord) {
        activeToken = mongoRecord.token || "";
        targetRepo = mongoRecord.repoName || "";
        if (!body.branchName) targetBranch = mongoRecord.branchName || "main";
        if (body.isPrivate === undefined) isPrivate = mongoRecord.isPrivate;
      }
    } else if (!activeToken) {
      const mongoRecord = await GitHubCredentialsService.getActiveToken();
      if (mongoRecord?.token) {
        activeToken = mongoRecord.token;
      }
    }

    const ruleResult = GitHubPushRulesEngine.validateRequest({
      token: activeToken,
      repoName: targetRepo,
      branchName: targetBranch,
    });

    if (!ruleResult.isValid) {
      return GitHubErrorRegistry.handle(ruleResult.errorCode!, ruleResult.errorMessage!);
    }

    const commitMsg = body.commitMessage || "feat: sync template code tree from OpenVSCode IDE";

    await GitHubCredentialsService.saveActiveToken({
      token: activeToken,
      repoName: targetRepo,
      branchName: targetBranch,
      isPrivate,
    });

    const authHeaders = {
      Authorization: `bearer ${activeToken}`,
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

    const { owner, actualRepo } = GitHubPushRulesEngine.parseOwnerRepo(targetRepo, authenticatedUser);
    const filesToCommit = TreeFlatteningService.resolveTreeDataWithFallback(body.treeData || [], body.activeTemplateId);

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
