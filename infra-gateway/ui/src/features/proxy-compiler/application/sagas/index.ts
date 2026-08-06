import { all, fork } from "redux-saga/effects";
import type { CompilerRepositoryPort } from "../../ports/compiler-repository.port";
import { CompilerRestAdapter } from "../../adapters/rest/compiler-rest.adapter";
import { createCompileProxySaga } from "./compile-proxy.saga";

export function createRootCompilerSaga(repository: CompilerRepositoryPort = new CompilerRestAdapter()) {
  return function* rootCompilerSaga() {
    yield all([fork(createCompileProxySaga(repository))]);
  };
}

export const rootCompilerSaga = createRootCompilerSaga();
