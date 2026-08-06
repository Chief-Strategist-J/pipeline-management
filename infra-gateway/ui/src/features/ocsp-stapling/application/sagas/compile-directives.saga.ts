import { call, put, takeLatest } from "redux-saga/effects";
import { ocspSlice } from "../../state/ocsp.slice";
import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import type { OCSPCompileResult } from "../../domain/entities/ocsp-policy.entity";

export function createCompileDirectivesSaga(repository: OCSPRepositoryPort) {
  function* compileWorker(action: ReturnType<typeof ocspSlice.actions.compileRequested>) {
    try {
      const result: OCSPCompileResult = yield call([repository, repository.compileDirectives], action.payload);
      yield put(ocspSlice.actions.compileSucceeded(result));
    } catch (err: unknown) {
      yield put(ocspSlice.actions.compileFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* compileDirectivesSaga() {
    yield takeLatest(ocspSlice.actions.compileRequested.type, compileWorker);
  };
}
