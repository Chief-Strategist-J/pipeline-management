import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CompiledOutput } from "../domain/entities/compiler.entity";

export interface CompilerState {
  status: "idle" | "compiling" | "succeeded" | "failed";
  lastOutput: CompiledOutput | null;
  error: string | null;
}

const initialState: CompilerState = {
  status: "idle",
  lastOutput: null,
  error: null,
};

export const compilerSlice = createSlice({
  name: "compiler",
  initialState,
  reducers: {
    compileRequested: (state, _action: PayloadAction<string>) => {
      state.status = "compiling";
      state.error = null;
    },
    compileSucceeded: (state, action: PayloadAction<CompiledOutput>) => {
      state.status = "succeeded";
      state.lastOutput = action.payload;
    },
    compileFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});
