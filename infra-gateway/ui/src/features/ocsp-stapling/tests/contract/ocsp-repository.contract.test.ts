import { describe, it, expect } from "vitest";
import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import { OCSPMockAdapter } from "../../adapters/mock/ocsp-mock.adapter";

function runAuthContract(makeAdapter: () => OCSPRepositoryPort) {
  it("getPolicy returns a valid policy object with resolver settings", async () => {
    const policy = await makeAdapter().getPolicy();
    expect(policy).toHaveProperty("enabled");
    expect(policy).toHaveProperty("resolver");
    expect(Array.isArray(policy.resolver.nameservers)).toBe(true);
  });

  it("compileDirectives returns proxy-specific directive string for Nginx", async () => {
    const result = await makeAdapter().compileDirectives("nginx");
    expect(result.proxyTarget).toBe("nginx");
    expect(result.directives).toContain("ssl_stapling");
  });
}

describe("OCSP Repository Contract Suite", () => {
  runAuthContract(() => new OCSPMockAdapter());
});
