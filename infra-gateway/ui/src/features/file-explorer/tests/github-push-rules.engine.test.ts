import { describe, it, expect } from "vitest";
import { GitHubPushRulesEngine } from "../rules/github-push-rules.engine";

describe("GitHubPushRulesEngine", () => {
  it("should fail validation when token is missing", () => {
    const result = GitHubPushRulesEngine.validateRequest({
      token: "",
      repoName: "my-repo",
    });

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("UNAUTHORIZED");
    expect(result.errorMessage).toContain("Token");
  });

  it("should fail validation when repoName is missing", () => {
    const result = GitHubPushRulesEngine.validateRequest({
      token: "ghp_validtoken123",
      repoName: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("BAD_REQUEST");
    expect(result.errorMessage).toContain("Repository name");
  });

  it("should pass validation when token and repoName are provided", () => {
    const result = GitHubPushRulesEngine.validateRequest({
      token: "ghp_validtoken123",
      repoName: "pipeline-gateway",
    });

    expect(result.isValid).toBe(true);
    expect(result.errorCode).toBeUndefined();
  });

  it("should parse owner and repo when slash is present", () => {
    const parsed = GitHubPushRulesEngine.parseOwnerRepo("Chief-Strategist-J/pipeline-management", "defaultUser");
    expect(parsed.owner).toBe("Chief-Strategist-J");
    expect(parsed.actualRepo).toBe("pipeline-management");
  });

  it("should fallback to default authenticated user when no slash is present", () => {
    const parsed = GitHubPushRulesEngine.parseOwnerRepo("my-service", "activeUser");
    expect(parsed.owner).toBe("activeUser");
    expect(parsed.actualRepo).toBe("my-service");
  });
});
