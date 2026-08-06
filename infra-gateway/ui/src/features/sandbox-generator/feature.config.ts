import { sandboxSlice } from "./state/sandbox.slice";
import { rootSandboxSaga } from "./application/sagas";

export const sandboxFeatureConfig = {
  key: "sandbox",
  reducer: sandboxSlice.reducer,
  saga: rootSandboxSaga,
};
