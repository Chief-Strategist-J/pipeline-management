import { DockerLabRestAdapter } from "../../adapters/rest/docker-lab-rest.adapter";
import { createManageDockerLabSaga } from "./manage-docker-lab.saga";

const defaultRepository = new DockerLabRestAdapter();
export const rootDockerLabSaga = createManageDockerLabSaga(defaultRepository);
