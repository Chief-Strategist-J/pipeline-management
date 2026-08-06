"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ocspSlice } from "../../state/ocsp.slice";
import {
  selectOCSPPolicy,
  selectOCSPStatus,
  selectOCSPError,
  selectOCSPCompiledDirectives,
} from "../../state/ocsp.selectors";
import type { OCSPStaplingPolicy } from "../../domain/entities/ocsp-policy.entity";

export function useOCSP() {
  const dispatch = useDispatch();
  const policy = useSelector(selectOCSPPolicy);
  const status = useSelector(selectOCSPStatus);
  const error = useSelector(selectOCSPError);
  const compiledDirectives = useSelector(selectOCSPCompiledDirectives);

  const fetchPolicy = useCallback(() => {
    dispatch(ocspSlice.actions.fetchPolicyRequested());
  }, [dispatch]);

  const updatePolicy = useCallback(
    (newPolicy: OCSPStaplingPolicy) => {
      dispatch(ocspSlice.actions.updatePolicyRequested(newPolicy));
    },
    [dispatch]
  );

  const compileTarget = useCallback(
    (target: string) => {
      dispatch(ocspSlice.actions.compileRequested(target));
    },
    [dispatch]
  );

  useEffect(() => {
    if (status === "idle") {
      fetchPolicy();
      compileTarget("nginx");
      compileTarget("traefik");
      compileTarget("apache");
    }
  }, [status, fetchPolicy, compileTarget]);

  return {
    policy,
    status,
    error,
    compiledDirectives,
    fetchPolicy,
    updatePolicy,
    compileTarget,
    isLoading: status === "loading",
  };
}
