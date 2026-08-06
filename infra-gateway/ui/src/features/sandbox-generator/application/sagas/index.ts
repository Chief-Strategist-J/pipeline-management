import { all, fork } from "redux-saga/effects";
import type { SandboxRepositoryPort } from "../../ports/sandbox-repository.port";
import { SandboxRestAdapter } from "../../adapters/rest/sandbox-rest.adapter";
import { createManageSandboxSaga } from "./manage-sandbox.saga";

export function createRootSandboxSaga(repository: SandboxRepositoryPort = new SandboxRestAdapter()) {
  return function* rootSandboxSaga() {
    yield all([fork(createManageSandboxSaga(repository))]);
  };
}

export const rootSandboxSaga = createRootSandboxSaga();
