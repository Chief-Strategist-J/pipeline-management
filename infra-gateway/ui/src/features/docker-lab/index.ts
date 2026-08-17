import { dockerLabSlice } from "./state/docker-lab.slice";
import { createManageDockerLabSaga } from "./application/sagas/manage-docker-lab.saga";
import { DockerLabRestAdapter } from "./adapters/rest/docker-lab-rest.adapter";
import type { FeatureModule } from "@/core/store/feature-registry";

const adapter = new DockerLabRestAdapter();

export const dockerLabFeatureConfig: FeatureModule = {
  key: "dockerLab",
  reducer: dockerLabSlice.reducer,
  saga: createManageDockerLabSaga(adapter),
};

export * from "./domain/entities/docker-image.entity";
export * from "./domain/docker-images.catalog";
export * from "./ports/docker-lab.port";
export * from "./adapters/rest/docker-lab-rest.adapter";
export * from "./state/docker-lab.slice";
export * from "./state/docker-lab.selectors";
export * from "./application/sagas/manage-docker-lab.saga";
export * from "./ui/hooks/useDockerLab";
export * from "./ui/components/ImageCatalog";
export * from "./ui/components/ExecutionPanel";
export * from "./ui/components/ConfigureModal";
export * from "./ui/components/TerminalModal";
export * from "./ui/components/ConfigPreviewModal";
