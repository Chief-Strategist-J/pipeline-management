import type { CompilerState } from "./compiler.slice";

export interface RootStateWithCompiler {
  compiler: CompilerState;
}

export const selectCompilerState = (state: RootStateWithCompiler) => state.compiler;
export const selectCompilerOutput = (state: RootStateWithCompiler) => state.compiler.lastOutput;
export const selectCompilerStatus = (state: RootStateWithCompiler) => state.compiler.status;
export const selectCompilerError = (state: RootStateWithCompiler) => state.compiler.error;
