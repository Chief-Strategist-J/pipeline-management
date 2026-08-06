import { all, fork } from "redux-saga/effects";
import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import { OCSPRestAdapter } from "../../adapters/rest/ocsp-rest.adapter";
import { createLoadPolicySaga } from "./load-policy.saga";
import { createCompileDirectivesSaga } from "./compile-directives.saga";

export function createRootOCSPSaga(repository: OCSPRepositoryPort = new OCSPRestAdapter()) {
  return function* rootOCSPSaga() {
    yield all([
      fork(createLoadPolicySaga(repository)),
      fork(createCompileDirectivesSaga(repository)),
    ]);
  };
}

export const rootOCSPSaga = createRootOCSPSaga();
