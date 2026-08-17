import { createSelector } from "@reduxjs/toolkit";
import type { DockerLabState } from "./docker-lab.slice";
import { filterCatalog } from "./docker-lab.slice";
import { DOCKER_IMAGES_CATALOG } from "../domain/docker-images.catalog";

export interface RootStateWithDockerLab {
  dockerLab: DockerLabState;
}

export const selectDockerLabState = (state: RootStateWithDockerLab) => state?.dockerLab;

export const selectCatalog = (state: RootStateWithDockerLab) => state?.dockerLab?.catalog ?? DOCKER_IMAGES_CATALOG;
export const selectSelectedCategory = (state: RootStateWithDockerLab) => state?.dockerLab?.selectedCategory ?? "All";
export const selectSearchQuery = (state: RootStateWithDockerLab) => state?.dockerLab?.searchQuery ?? "";

export const selectFilteredCatalog = createSelector(
  [selectCatalog, selectSearchQuery, selectSelectedCategory],
  (catalog, search, category) => filterCatalog(catalog || [], search || "", category || "All")
);

export const selectConfiguredImage = (state: RootStateWithDockerLab) => state?.dockerLab?.configuredImage ?? null;
export const selectActiveConfig = (state: RootStateWithDockerLab) => state?.dockerLab?.activeConfig ?? null;

export const selectExecutions = (state: RootStateWithDockerLab) => state?.dockerLab?.executions ?? {};
export const selectTestResults = (state: RootStateWithDockerLab) => state?.dockerLab?.testResults ?? {};
export const selectContainerLogs = (state: RootStateWithDockerLab) => state?.dockerLab?.containerLogs ?? {};
export const selectActiveContainerId = (state: RootStateWithDockerLab) => state?.dockerLab?.activeContainerId ?? null;
export const selectDockerLabStatus = (state: RootStateWithDockerLab) => state?.dockerLab?.status ?? "idle";
export const selectDockerLabError = (state: RootStateWithDockerLab) => state?.dockerLab?.error ?? null;

export const selectAllRunningContainers = createSelector(
  [selectExecutions],
  (executions) => Object.values(executions || {}).flatMap((e) => e?.containers || [])
);
