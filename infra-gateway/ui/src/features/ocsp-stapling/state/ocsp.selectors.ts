import type { OCSPState } from "./ocsp.slice";

export interface RootStateWithOCSP {
  ocsp: OCSPState;
}

export const selectOCSPState = (state: RootStateWithOCSP) => state.ocsp;
export const selectOCSPPolicy = (state: RootStateWithOCSP) => state.ocsp.policy;
export const selectOCSPStatus = (state: RootStateWithOCSP) => state.ocsp.status;
export const selectOCSPError = (state: RootStateWithOCSP) => state.ocsp.error;
export const selectOCSPCompiledDirectives = (state: RootStateWithOCSP) => state.ocsp.compiledDirectives;
