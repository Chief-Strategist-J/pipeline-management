import { all, fork } from "redux-saga/effects";
import { featureRegistry } from "./feature-registry";

export function* rootSaga() {
  yield all(featureRegistry.map((f) => fork(f.saga)));
}
