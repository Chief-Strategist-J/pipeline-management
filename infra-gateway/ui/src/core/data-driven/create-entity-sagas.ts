import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CrudPort } from "../data-driven/create-entity-adapter";
import type { GenericEntityState } from "../data-driven/create-entity-slice";

export function createEntitySaga<T>(
  slice: { actions: any },
  adapter: CrudPort<T>
) {
  function* fetchWorker() {
    try {
      const items: T[] = yield call([adapter, adapter.list]);
      yield put(slice.actions.fetchSucceeded(items));
    } catch (err: unknown) {
      yield put(slice.actions.fetchFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  function* createWorker(action: PayloadAction<Partial<T>>) {
    try {
      const created: T = yield call([adapter, adapter.create], action.payload);
      yield put(slice.actions.fetchRequested());
    } catch (err: unknown) {
      yield put(slice.actions.fetchFailed(err instanceof Error ? err.message : String(err)));
    }
  }

  return function* entitySaga() {
    yield takeLatest(slice.actions.fetchRequested.type, fetchWorker);
    if (slice.actions.createRequested) {
      yield takeLatest(slice.actions.createRequested.type, createWorker);
    }
  };
}
