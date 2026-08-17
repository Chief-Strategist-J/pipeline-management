import { dockerLabSlice } from "./state/docker-lab.slice";
import { rootDockerLabSaga } from "./application/sagas";

export const dockerLabFeatureConfig = {
  key: "dockerLab",
  reducer: dockerLabSlice.reducer,
  saga: rootDockerLabSaga,
};
