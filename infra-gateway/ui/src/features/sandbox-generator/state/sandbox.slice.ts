import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Sandbox, CreateSandboxPayload } from "../domain/entities/sandbox.entity";

export interface SandboxState {
  status: "idle" | "loading" | "succeeded" | "failed";
  sandboxes: Sandbox[];
  error: string | null;
}

const initialState: SandboxState = {
  status: "idle",
  sandboxes: [],
  error: null,
};

export const sandboxSlice = createSlice({
  name: "sandbox",
  initialState,
  reducers: {
    listRequested: (state) => {
      state.status = "loading";
      state.error = null;
    },
    listSucceeded: (state, action: PayloadAction<Sandbox[]>) => {
      state.status = "succeeded";
      state.sandboxes = action.payload;
    },
    listFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    createRequested: (state, _action: PayloadAction<CreateSandboxPayload>) => {
      state.status = "loading";
      state.error = null;
    },
    createSucceeded: (state, action: PayloadAction<Sandbox>) => {
      state.status = "succeeded";
      state.sandboxes.push(action.payload);
    },
    createFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    destroyRequested: (state, _action: PayloadAction<string>) => {
      state.status = "loading";
      state.error = null;
    },
    destroySucceeded: (state, action: PayloadAction<string>) => {
      state.status = "succeeded";
      state.sandboxes = state.sandboxes.filter((s) => s.sandboxId !== action.payload);
    },
    destroyFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});
