import { compilerSlice } from "./state/compiler.slice";
import { rootCompilerSaga } from "./application/sagas";

export const compilerFeatureConfig = {
  key: "compiler",
  reducer: compilerSlice.reducer,
  saga: rootCompilerSaga,
};
