/**
 * ALGORITHM: GITHUB PUSH PRECONDITION & PARSING RULES ENGINE
 * ============================================================================
 * 1. REQUEST PRECONDITION EVALUATION:
 *    - Delegates token validation to `EmptyTokenEdgeCase`.
 *    - Delegates repository validation to `InvalidRepoNameEdgeCase`.
 *    - Returns structured `RuleValidationResult` with explicit error codes (`UNAUTHORIZED`, `BAD_REQUEST`).
 * 
 * 2. OWNER / REPOSITORY NAME PARSING:
 *    - Delegates `owner/repository` parsing to `OwnerRepoFormatEdgeCase`.
 * ============================================================================
 */

import { EmptyTokenEdgeCase } from "../application/services/edge-cases/empty-token.edge-case";
import { InvalidRepoNameEdgeCase } from "../application/services/edge-cases/invalid-repo-name.edge-case";
import { OwnerRepoFormatEdgeCase } from "../application/services/edge-cases/owner-repo-format.edge-case";

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
    const tokenCheck = EmptyTokenEdgeCase.handle(ctx.token);
    if (tokenCheck.triggered) {
      return {
        isValid: false,
        errorCode: tokenCheck.errorCode,
        errorMessage: tokenCheck.errorMessage,
      };
    }

    const repoCheck = InvalidRepoNameEdgeCase.handle(ctx.repoName);
    if (repoCheck.triggered) {
      return {
        isValid: false,
        errorCode: repoCheck.errorCode,
        errorMessage: repoCheck.errorMessage,
      };
    }

    return { isValid: true };
  }

  public static parseOwnerRepo(inputRepoName: string, defaultUser: string): { owner: string; actualRepo: string } {
    return OwnerRepoFormatEdgeCase.parse(inputRepoName, defaultUser);
  }
}
