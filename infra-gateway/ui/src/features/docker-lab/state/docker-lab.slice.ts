import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DockerImage,
  ContainerConfig,
  ExecutionResult,
  TestResult,
  LogLine
} from "../domain/entities/docker-image.entity";
import { DOCKER_IMAGES_CATALOG } from "../domain/docker-images.catalog";

function filterCatalog(catalog: DockerImage[], search: string, category: string): DockerImage[] {
  const searchLower = (search || "").toLowerCase().trim();
  const catLower = (category || "All").toLowerCase().trim();

  return catalog.filter((img) => {
    const matchesSearch =
      !searchLower ||
      img.name.toLowerCase().includes(searchLower) ||
      img.image.toLowerCase().includes(searchLower) ||
      img.description.toLowerCase().includes(searchLower) ||
      img.category.toLowerCase().includes(searchLower);

    const imgCatLower = (img.category || "").toLowerCase();
    const matchesCategory =
      catLower === "all" ||
      imgCatLower === catLower ||
      imgCatLower.includes(catLower) ||
      catLower.includes(imgCatLower);

    return matchesSearch && matchesCategory;
  });
}

export interface DockerLabState {
  status: "idle" | "loading" | "succeeded" | "failed";
  dockerAvailable: boolean | null;
  dockerVersion: string | null;
  dockerError: string | null;
  catalog: DockerImage[];
  selectedCategory: string;
  searchQuery: string;
  configuredImage: DockerImage | null;
  activeConfig: ContainerConfig | null;
  executions: Record<string, ExecutionResult>;
  testResults: Record<string, TestResult>;
  containerLogs: Record<string, LogLine[]>;
  activeContainerId: string | null;
  error: string | null;
}

const initialState: DockerLabState = {
  status: "idle",
  dockerAvailable: null,
  dockerVersion: null,
  dockerError: null,
  catalog: DOCKER_IMAGES_CATALOG,
  selectedCategory: "All",
  searchQuery: "",
  configuredImage: null,
  activeConfig: null,
  executions: {},
  testResults: {},
  containerLogs: {},
  activeContainerId: null,
  error: null,
};

export const dockerLabSlice = createSlice({
  name: "dockerLab",
  initialState,
  reducers: {
    setDockerStatus: (state, action: PayloadAction<{ available: boolean; version?: string; error?: string }>) => {
      state.dockerAvailable = action.payload.available;
      state.dockerVersion = action.payload.version || null;
      state.dockerError = action.payload.error || null;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    openConfigModal: (state, action: PayloadAction<DockerImage>) => {
      state.configuredImage = action.payload;
      state.activeConfig = action.payload.defaultConfig;
    },
    closeConfigModal: (state) => {
      state.configuredImage = null;
      state.activeConfig = null;
    },
    updateActiveConfig: (state, action: PayloadAction<Partial<ContainerConfig>>) => {
      if (state.activeConfig) {
        state.activeConfig = { ...state.activeConfig, ...action.payload };
      }
    },
    executeRequested: (state, _action: PayloadAction<ContainerConfig>) => {
      state.status = "loading";
      state.error = null;
    },
    executeSucceeded: (state, action: PayloadAction<ExecutionResult>) => {
      state.status = "succeeded";
      state.executions[action.payload.imageId] = action.payload;
      if (action.payload.containers.length > 0) {
        state.activeContainerId = action.payload.containers[0].containerId;
      }
      state.configuredImage = null;
      state.activeConfig = null;
    },
    executeFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    testRequested: (state, _action: PayloadAction<{ containerId: string; probeType?: string; port?: number; path?: string }>) => {
      state.status = "loading";
    },
    testSucceeded: (state, action: PayloadAction<TestResult>) => {
      state.status = "succeeded";
      state.testResults[action.payload.containerId] = action.payload;
    },
    testFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    logsRequested: (state, _action: PayloadAction<string>) => {},
    logsSucceeded: (state, action: PayloadAction<{ containerId: string; logs: LogLine[] }>) => {
      state.containerLogs[action.payload.containerId] = action.payload.logs;
    },
    stopRequested: (state, _action: PayloadAction<{ containerId: string; backup: boolean }>) => {
      state.status = "loading";
    },
    stopSucceeded: (state, action: PayloadAction<string>) => {
      state.status = "succeeded";
      Object.keys(state.executions).forEach((imageId) => {
        state.executions[imageId].containers = state.executions[imageId].containers.filter(
          (c) => c.containerId !== action.payload
        );
      });
      if (state.activeContainerId === action.payload) {
        state.activeContainerId = null;
      }
    },
    stopFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    setActiveContainerId: (state, action: PayloadAction<string | null>) => {
      state.activeContainerId = action.payload;
    }
  },
});

export { filterCatalog };
