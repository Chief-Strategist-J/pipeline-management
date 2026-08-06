import { ocspSlice } from "./state/ocsp.slice";
import { rootOCSPSaga } from "./application/sagas";

export const ocspFeatureConfig = {
  key: "ocsp",
  reducer: ocspSlice.reducer,
  saga: rootOCSPSaga,
};
