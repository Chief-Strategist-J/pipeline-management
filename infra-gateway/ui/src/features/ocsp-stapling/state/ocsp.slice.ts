import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OCSPStaplingPolicy, OCSPCompileResult } from "../domain/entities/ocsp-policy.entity";

export interface OCSPState {
  status: "idle" | "loading" | "succeeded" | "failed";
  policy: OCSPStaplingPolicy | null;
  compiledDirectives: Record<string, OCSPCompileResult>;
  error: string | null;
}

const initialState: OCSPState = {
  status: "idle",
  policy: null,
  compiledDirectives: {},
  error: null,
};

export const ocspSlice = createSlice({
  name: "ocsp",
  initialState,
  reducers: {
    fetchPolicyRequested: (state) => {
      state.status = "loading";
      state.error = null;
    },
    fetchPolicySucceeded: (state, action: PayloadAction<OCSPStaplingPolicy>) => {
      state.status = "succeeded";
      state.policy = action.payload;
    },
    fetchPolicyFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    updatePolicyRequested: (state, _action: PayloadAction<OCSPStaplingPolicy>) => {
      state.status = "loading";
      state.error = null;
    },
    updatePolicySucceeded: (state, action: PayloadAction<OCSPStaplingPolicy>) => {
      state.status = "succeeded";
      state.policy = action.payload;
    },
    updatePolicyFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    compileRequested: (state, _action: PayloadAction<string>) => {
      state.error = null;
    },
    compileSucceeded: (state, action: PayloadAction<OCSPCompileResult>) => {
      state.compiledDirectives[action.payload.proxyTarget] = action.payload;
    },
    compileFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});
