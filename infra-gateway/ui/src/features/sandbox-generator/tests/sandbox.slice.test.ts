import { describe, it, expect } from "vitest";
import { sandboxSlice, type SandboxState } from "../state/sandbox.slice";
import type { Sandbox } from "../domain/entities/sandbox.entity";

describe("Sandbox Generator Redux Slice Unit Tests", () => {
  const initial: SandboxState = {
    status: "idle",
    sandboxes: [],
    error: null,
  };

  const sampleSb: Sandbox = {
    sandboxId: "sbx-123",
    name: "test-sb",
    status: "active",
    namespace: "sandbox-sbx-123",
    isolatedNetwork: true,
    mockDependencies: ["redis"],
    createdAt: "2026-08-06T00:00:00Z",
  };

  it("should populate sandboxes on listSucceeded", () => {
    const next = sandboxSlice.reducer(initial, sandboxSlice.actions.listSucceeded([sampleSb]));
    expect(next.status).toBe("succeeded");
    expect(next.sandboxes).toHaveLength(1);
    expect(next.sandboxes[0].sandboxId).toBe("sbx-123");
  });

  it("should remove destroyed sandbox on destroySucceeded", () => {
    const stateWithSb: SandboxState = { ...initial, sandboxes: [sampleSb] };
    const next = sandboxSlice.reducer(stateWithSb, sandboxSlice.actions.destroySucceeded("sbx-123"));
    expect(next.sandboxes).toHaveLength(0);
  });
});
