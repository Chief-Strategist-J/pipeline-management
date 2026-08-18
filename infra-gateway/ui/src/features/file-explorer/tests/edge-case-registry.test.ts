import { describe, it, expect } from "vitest";
import {
  EmptyTokenEdgeCase,
  ExpiredTokenEdgeCase,
  RateLimitEdgeCase,
  InvalidRepoNameEdgeCase,
  OwnerRepoFormatEdgeCase,
  SlashNormalizationEdgeCase,
  BinaryContentEdgeCase,
  EmptyFileContentEdgeCase,
  DuplicateFilePathsEdgeCase,
  MaxPayloadSizeEdgeCase,
  GraphqlMutationFallbackEdgeCase,
} from "../application/services/edge-cases/edge-case-registry";

describe("Edge Case Handlers Suite", () => {
  it("EmptyTokenEdgeCase should trigger on missing token", () => {
    expect(EmptyTokenEdgeCase.handle("").triggered).toBe(true);
    expect(EmptyTokenEdgeCase.handle("ghp_valid").triggered).toBe(false);
  });

  it("ExpiredTokenEdgeCase should trigger on 401 status", () => {
    expect(ExpiredTokenEdgeCase.handle(401, "Bad credentials").triggered).toBe(true);
    expect(ExpiredTokenEdgeCase.handle(200, "OK").triggered).toBe(false);
  });

  it("RateLimitEdgeCase should trigger on 429 status", () => {
    expect(RateLimitEdgeCase.handle(429, "rate limit exceeded").triggered).toBe(true);
    expect(RateLimitEdgeCase.handle(200, "OK").triggered).toBe(false);
  });

  it("InvalidRepoNameEdgeCase should trigger on special chars", () => {
    expect(InvalidRepoNameEdgeCase.handle("repo@#$").triggered).toBe(true);
    expect(InvalidRepoNameEdgeCase.handle("valid-repo").triggered).toBe(false);
  });

  it("OwnerRepoFormatEdgeCase should parse owner and repo", () => {
    expect(OwnerRepoFormatEdgeCase.parse("my-org/my-repo", "defaultUser")).toEqual({
      owner: "my-org",
      actualRepo: "my-repo",
    });
  });

  it("SlashNormalizationEdgeCase should normalize slashes cleanly", () => {
    expect(SlashNormalizationEdgeCase.normalizePath("\\src\\app\\page.tsx\\")).toBe("src/app/page.tsx");
  });

  it("BinaryContentEdgeCase should encode base64 safely", () => {
    expect(BinaryContentEdgeCase.encodeBase64("hello")).toBe("aGVsbG8=");
    expect(BinaryContentEdgeCase.isBinaryExtension("image.png")).toBe(true);
  });

  it("EmptyFileContentEdgeCase should default non-string values to empty string", () => {
    expect(EmptyFileContentEdgeCase.ensureContentString(null)).toBe("");
    expect(EmptyFileContentEdgeCase.ensureContentString("content")).toBe("content");
  });

  it("DuplicateFilePathsEdgeCase should deduplicate identical file paths", () => {
    const entries = [
      { path: "src/index.ts", content: "old" },
      { path: "src/index.ts", content: "new" },
    ];
    const deduplicated = DuplicateFilePathsEdgeCase.deduplicate(entries);
    expect(deduplicated.length).toBe(1);
    expect(deduplicated[0].content).toBe("new");
  });

  it("MaxPayloadSizeEdgeCase should detect payload size overflow", () => {
    expect(MaxPayloadSizeEdgeCase.isPayloadExceeded([{ path: "file.txt", content: "short" }])).toBe(false);
  });

  it("GraphqlMutationFallbackEdgeCase should trigger fallback on GraphQL failure", () => {
    expect(GraphqlMutationFallbackEdgeCase.ShouldFallbackToRest({ success: false, error: "Mutation failed" })).toBe(true);
  });
});
