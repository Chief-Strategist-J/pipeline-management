import { call, put, takeLatest } from "redux-saga/effects";
import { ocspSlice } from "../../state/ocsp.slice";
import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import type { OCSPStaplingPolicy } from "../../domain/entities/ocsp-policy.entity";

export function createLoadPolicySaga(repository: OCSPRepositoryPort) {
  function* fetchPolicyWorker() {
    try {
      const policy: OCSPStaplingPolicy = yield call([repository, repository.getPolicy]);
      yield put(ocspSlice.actions.fetchPolicySucceeded(policy));
    } catch (err: unknown) {
      yield put(ocspSlice.actions.fetchPolicyFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* updatePolicyWorker(action: ReturnType<typeof ocspSlice.actions.updatePolicyRequested>) {
    try {
      const updated: OCSPStaplingPolicy = yield call([repository, repository.updatePolicy], action.payload);
      yield put(ocspSlice.actions.updatePolicySucceeded(updated));
    } catch (err: unknown) {
      yield put(ocspSlice.actions.updatePolicyFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* loadPolicySaga() {
    yield takeLatest(ocspSlice.actions.fetchPolicyRequested.type, fetchPolicyWorker);
    yield takeLatest(ocspSlice.actions.updatePolicyRequested.type, updatePolicyWorker);
  };
}
