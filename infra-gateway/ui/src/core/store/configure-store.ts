import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { featureRegistry } from "./feature-registry";
import { rootSaga } from "./root-saga";

export function configureAppStore() {
  const rootReducer = combineReducers(
    Object.fromEntries(featureRegistry.map((f) => [f.key, f.reducer]))
  );

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);
  return store;
}

export type AppStore = ReturnType<typeof configureAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
