import { describe, it, expect } from "vitest";
import { ocspSlice, type OCSPState } from "../state/ocsp.slice";
import type { OCSPStaplingPolicy, OCSPCompileResult } from "../domain/entities/ocsp-policy.entity";

describe("OCSP Stapling Redux Slice Unit Tests", () => {
  const initial: OCSPState = {
    status: "idle",
    policy: null,
    compiledDirectives: {},
    error: null,
  };

  const samplePolicy: OCSPStaplingPolicy = {
    enabled: true,
    verify: true,
    resolver: { nameservers: ["8.8.8.8"], validDuration: "300s", timeout: "5s" },
    cache: { type: "shared", sharedZoneName: "ocsp", sharedZoneSize: "10m", filePath: "" },
    responder: { overrideUrl: "", trustedCertificate: "" },
  };

  it("should set loading status on fetchPolicyRequested", () => {
    const next = ocspSlice.reducer(initial, ocspSlice.actions.fetchPolicyRequested());
    expect(next.status).toBe("loading");
    expect(next.error).toBeNull();
  });

  it("should set policy and succeeded status on fetchPolicySucceeded", () => {
    const next = ocspSlice.reducer(initial, ocspSlice.actions.fetchPolicySucceeded(samplePolicy));
    expect(next.status).toBe("succeeded");
    expect(next.policy).toEqual(samplePolicy);
  });

  it("should store compiled directive result by proxy target key", () => {
    const compileResult: OCSPCompileResult = {
      proxyTarget: "nginx",
      directives: "ssl_stapling on;",
      enabled: true,
    };
    const next = ocspSlice.reducer(initial, ocspSlice.actions.compileSucceeded(compileResult));
    expect(next.compiledDirectives["nginx"]).toEqual(compileResult);
  });
});
