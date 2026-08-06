import { call, put, takeLatest } from "redux-saga/effects";
import { compilerSlice } from "../../state/compiler.slice";
import type { CompilerRepositoryPort } from "../../ports/compiler-repository.port";
import type { CompiledOutput } from "../../domain/entities/compiler.entity";

export function createCompileProxySaga(repository: CompilerRepositoryPort) {
  function* compileWorker(action: ReturnType<typeof compilerSlice.actions.compileRequested>) {
    try {
      const output: CompiledOutput = yield call([repository, repository.compile], action.payload);
      yield put(compilerSlice.actions.compileSucceeded(output));
    } catch (err: unknown) {
      yield put(compilerSlice.actions.compileFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* compileProxySaga() {
    yield takeLatest(compilerSlice.actions.compileRequested.type, compileWorker);
  };
}
