import { dockerLabSlice } from "./state/docker-lab.slice";
import { createManageDockerLabSaga } from "./application/sagas/manage-docker-lab.saga";
import { DockerLabRestAdapter } from "./adapters/rest/docker-lab-rest.adapter";

const defaultAdapter = new DockerLabRestAdapter();

export const dockerLabFeatureConfig = {
  key: "dockerLab",
  reducer: dockerLabSlice.reducer,
  saga: createManageDockerLabSaga(defaultAdapter),
};

export * from "./constants/docker-lab.constants";
export * from "./constants/docker-help.constants";
export * from "./domain/entities/docker-image.entity";
export * from "./domain/docker-images.catalog";
export * from "./adapters/rest/docker-lab-rest.adapter";
export * from "./ports/docker-lab.port";
export * from "./state/docker-lab.slice";
export * from "./state/docker-lab.selectors";
export * from "./application/sagas/manage-docker-lab.saga";
export * from "./rules/docker-backup.rules";
export * from "./rules/docker-orchestration.rules";
export * from "./rules/docker-stack-preset.rules";

export * from "./ui/hooks/useDockerLab";
export * from "./ui/hooks/useContainerWorkspace";

export * from "./ui/components/ImageCatalog";
export * from "./ui/components/ExecutionPanel";
export * from "./ui/components/ConfigureModal";
export * from "./ui/components/ConfigPreviewModal";
export * from "./ui/components/ContainerWorkspace";
export * from "./ui/components/ProductionComboSelector";
export * from "./ui/components/MultiStackDashboard";
