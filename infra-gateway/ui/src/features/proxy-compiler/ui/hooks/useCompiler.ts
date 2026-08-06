"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { compilerSlice } from "../../state/compiler.slice";
import {
  selectCompilerOutput,
  selectCompilerStatus,
  selectCompilerError,
} from "../../state/compiler.selectors";

export function useCompiler() {
  const dispatch = useDispatch();
  const output = useSelector(selectCompilerOutput);
  const status = useSelector(selectCompilerStatus);
  const error = useSelector(selectCompilerError);

  const compile = useCallback(
    (target: string = "all") => {
      dispatch(compilerSlice.actions.compileRequested(target));
    },
    [dispatch]
  );

  return {
    output,
    status,
    error,
    compile,
    isLoading: status === "compiling",
  };
}
