import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitHubPushService } from "../application/services/github-push.service";
import { TreeFlatteningService } from "../application/services/tree-flattening.service";
import { GitHubPushRulesEngine } from "../rules/github-push-rules.engine";
import { PROJECT_TEMPLATES_CATALOG } from "../domain/project-templates.catalog";

describe("E2E Integration: Complete GitHub Sync Pipeline", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should process end-to-end template selection, precondition validation, tree flattening, and GraphQL commit", async () => {
    const selectedTemplate = PROJECT_TEMPLATES_CATALOG.find((t) => t.id === "nextjs-extreme-scale") || PROJECT_TEMPLATES_CATALOG[0];
    expect(selectedTemplate).toBeDefined();

    const flattenedFiles = TreeFlatteningService.flattenTree(selectedTemplate.tree);
    expect(flattenedFiles.length).toBeGreaterThan(0);
    expect(flattenedFiles.every((f) => !f.path.startsWith(`${selectedTemplate.rootFolderName}/`))).toBe(true);

    const ruleValidation = GitHubPushRulesEngine.validateRequest({
      token: "ghp_mocke2epipelinetoken",
      repoName: "nextjs-extreme-scale-app",
      branchName: "main",
    });
    expect(ruleValidation.isValid).toBe(true);

    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      const urlStr = String(url);

      if (urlStr.includes("api.github.com/user")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ login: "chief-strategist" }),
        } as Response;
      }

      if (urlStr.includes("api.github.com/graphql")) {
        const bodyStr = String(options?.body || "");
        if (bodyStr.includes("GetRepoInfo")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              data: {
                repository: {
                  id: "repo_999",
                  url: "https://github.com/chief-strategist/nextjs-extreme-scale-app",
                  ref: { target: { oid: "head_oid_111" } },
                },
              },
            }),
          } as Response;
        }
        if (bodyStr.includes("CreateCommit")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              data: {
                createCommitOnBranch: {
                  commit: {
                    oid: "sha_e2e_commit_777777777777",
                    url: "https://github.com/chief-strategist/nextjs-extreme-scale-app/commit/7777777",
                  },
                },
              },
            }),
          } as Response;
        }
      }

      return { ok: false, status: 400, text: async () => "Mock Error" } as Response;
    });

    const response = await GitHubPushService.executePush({
      token: "ghp_mocke2epipelinetoken",
      repoName: "nextjs-extreme-scale-app",
      branchName: "main",
      commitMessage: "e2e: sync full Next.js extreme scale architecture template",
      treeData: selectedTemplate.tree,
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.message).toContain("GitHub GraphQL API v4");
    expect(result.repoUrl).toContain("chief-strategist/nextjs-extreme-scale-app");
  });
});
