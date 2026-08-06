import type { SandboxState } from "./sandbox.slice";

export interface RootStateWithSandbox {
  sandbox: SandboxState;
}

export const selectSandboxState = (state: RootStateWithSandbox) => state.sandbox;
export const selectSandboxes = (state: RootStateWithSandbox) => state.sandbox.sandboxes;
export const selectSandboxStatus = (state: RootStateWithSandbox) => state.sandbox.status;
export const selectSandboxError = (state: RootStateWithSandbox) => state.sandbox.error;
