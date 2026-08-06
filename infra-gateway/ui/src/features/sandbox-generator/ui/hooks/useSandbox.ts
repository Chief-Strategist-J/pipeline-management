"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sandboxSlice } from "../../state/sandbox.slice";
import {
  selectSandboxes,
  selectSandboxStatus,
  selectSandboxError,
} from "../../state/sandbox.selectors";
import type { CreateSandboxPayload } from "../../domain/entities/sandbox.entity";

export function useSandbox() {
  const dispatch = useDispatch();
  const sandboxes = useSelector(selectSandboxes);
  const status = useSelector(selectSandboxStatus);
  const error = useSelector(selectSandboxError);

  const fetchSandboxes = useCallback(() => {
    dispatch(sandboxSlice.actions.listRequested());
  }, [dispatch]);

  const createSandbox = useCallback(
    (payload: CreateSandboxPayload) => {
      dispatch(sandboxSlice.actions.createRequested(payload));
    },
    [dispatch]
  );

  const destroySandbox = useCallback(
    (sandboxId: string) => {
      dispatch(sandboxSlice.actions.destroyRequested(sandboxId));
    },
    [dispatch]
  );

  useEffect(() => {
    if (status === "idle") {
      fetchSandboxes();
    }
  }, [status, fetchSandboxes]);

  return {
    sandboxes,
    status,
    error,
    fetchSandboxes,
    createSandbox,
    destroySandbox,
    isLoading: status === "loading",
  };
}
