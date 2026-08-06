import { describe, it, expect } from "vitest";
import { compilerSlice, type CompilerState } from "../state/compiler.slice";
import type { CompiledOutput } from "../domain/entities/compiler.entity";

describe("Proxy Compiler Redux Slice Unit Tests", () => {
  const initial: CompilerState = {
    status: "idle",
    lastOutput: null,
    error: null,
  };

  it("should set status to compiling on compileRequested", () => {
    const next = compilerSlice.reducer(initial, compilerSlice.actions.compileRequested("all"));
    expect(next.status).toBe("compiling");
  });

  it("should store lastOutput on compileSucceeded", () => {
    const mockOutput: CompiledOutput = {
      target: "all",
      files: [{ filename: "nginx.conf", path: "path", content: "test", proxyType: "nginx" }],
      timestamp: "2026-08-06T00:00:00Z",
      syntaxValid: true,
    };
    const next = compilerSlice.reducer(initial, compilerSlice.actions.compileSucceeded(mockOutput));
    expect(next.status).toBe("succeeded");
    expect(next.lastOutput).toEqual(mockOutput);
  });
});
