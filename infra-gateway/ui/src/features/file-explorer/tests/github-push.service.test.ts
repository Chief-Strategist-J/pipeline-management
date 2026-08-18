import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitHubPushService } from "../application/services/github-push.service";

describe("GitHubPushService Integration Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return UNAUTHORIZED response when PAT token is missing", async () => {
    const res = await GitHubPushService.executePush({
      token: "",
      repoName: "my-repo",
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.code).toBe("UNAUTHORIZED");
  });

  it("should return BAD_REQUEST response when repoName is missing", async () => {
    const res = await GitHubPushService.executePush({
      token: "ghp_mocktoken",
      repoName: "",
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.code).toBe("BAD_REQUEST");
  });

  it("should return UNAUTHORIZED when GitHub token API verification fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("api.github.com/user")) {
        return {
          ok: false,
          status: 401,
          text: async () => "Bad credentials",
        } as Response;
      }
      return { ok: false, status: 500 } as Response;
    });

    const res = await GitHubPushService.executePush({
      token: "ghp_invalidtoken",
      repoName: "test-repo",
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid GitHub Token");
  });

  it("should successfully execute GraphQL push pipeline when token is valid", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes("api.github.com/user")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ login: "testuser" }),
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
                  id: "repo_123",
                  url: "https://github.com/testuser/test-repo",
                  ref: { target: { oid: "sha_head_123" } },
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
                    oid: "sha_new_commit_456789012345",
                    url: "https://github.com/testuser/test-repo/commit/sha_new",
                  },
                },
              },
            }),
          } as Response;
        }
      }
      return { ok: false, status: 400, text: async () => "Error" } as Response;
    });

    const res = await GitHubPushService.executePush({
      token: "ghp_mockvalidtoken",
      repoName: "test-repo",
      branchName: "main",
      commitMessage: "test: verify GraphQL commit pipeline",
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("GitHub GraphQL API v4");
    expect(data.repoUrl).toContain("testuser/test-repo");
  });
});
