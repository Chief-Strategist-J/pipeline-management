import { call, put, takeLatest } from "redux-saga/effects";
import { sandboxSlice } from "../../state/sandbox.slice";
import type { SandboxRepositoryPort } from "../../ports/sandbox-repository.port";
import type { Sandbox } from "../../domain/entities/sandbox.entity";

export function createManageSandboxSaga(repository: SandboxRepositoryPort) {
  function* listWorker() {
    try {
      const list: Sandbox[] = yield call([repository, repository.listSandboxes]);
      yield put(sandboxSlice.actions.listSucceeded(list));
    } catch (err: unknown) {
      yield put(sandboxSlice.actions.listFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* createWorker(action: ReturnType<typeof sandboxSlice.actions.createRequested>) {
    try {
      const created: Sandbox = yield call([repository, repository.createSandbox], action.payload);
      yield put(sandboxSlice.actions.createSucceeded(created));
    } catch (err: unknown) {
      yield put(sandboxSlice.actions.createFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* destroyWorker(action: ReturnType<typeof sandboxSlice.actions.destroyRequested>) {
    try {
      const success: boolean = yield call([repository, repository.destroySandbox], action.payload);
      if (success) {
        yield put(sandboxSlice.actions.destroySucceeded(action.payload));
      } else {
        yield put(sandboxSlice.actions.destroyFailed("Failed to destroy sandbox container"));
      }
    } catch (err: unknown) {
      yield put(sandboxSlice.actions.destroyFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* manageSandboxSaga() {
    yield takeLatest(sandboxSlice.actions.listRequested.type, listWorker);
    yield takeLatest(sandboxSlice.actions.createRequested.type, createWorker);
    yield takeLatest(sandboxSlice.actions.destroyRequested.type, destroyWorker);
  };
}
