"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { dockerLabSlice } from "../../state/docker-lab.slice";
import {
  selectFilteredCatalog,
  selectSelectedCategory,
  selectSearchQuery,
  selectConfiguredImage,
  selectActiveConfig,
  selectExecutions,
  selectTestResults,
  selectContainerLogs,
  selectActiveContainerId,
  selectAllRunningContainers,
  selectDockerLabStatus,
  selectDockerLabError
} from "../../state/docker-lab.selectors";
import type {
  DockerImage,
  ContainerConfig
} from "../../domain/entities/docker-image.entity";
import { DockerLabRestAdapter } from "../../adapters/rest/docker-lab-rest.adapter";
import { DOCKER_IMAGES_CATALOG } from "../../domain/docker-images.catalog";

const adapter = new DockerLabRestAdapter();

export function useDockerLab() {
  const dispatch = useDispatch();
  const router = useRouter();

  const catalog = useSelector(selectFilteredCatalog);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchQuery = useSelector(selectSearchQuery);
  const configuredImage = useSelector(selectConfiguredImage);
  const activeConfig = useSelector(selectActiveConfig);
  const executions = useSelector(selectExecutions);
  const testResults = useSelector(selectTestResults);
  const containerLogs = useSelector(selectContainerLogs);
  const activeContainerId = useSelector(selectActiveContainerId);
  const runningContainers = useSelector(selectAllRunningContainers);
  const status = useSelector(selectDockerLabStatus);
  const error = useSelector(selectDockerLabError);

  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [executingImageId, setExecutingImageId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewConfigs, setPreviewConfigs] = useState<ContainerConfig[]>([]);

  useEffect(() => {
    adapter.checkDockerStatus().then((res) => {
      dispatch(dockerLabSlice.actions.setDockerStatus(res));
    }).catch(() => {});
  }, [dispatch]);

  const setCategory = useCallback((category: string) => {
    dispatch(dockerLabSlice.actions.setCategory(category));
  }, [dispatch]);

  const setSearchQuery = useCallback((query: string) => {
    dispatch(dockerLabSlice.actions.setSearchQuery(query));
  }, [dispatch]);

  const toggleSelectImage = useCallback((id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedImageIds(catalog.map((i) => i.id));
  }, [catalog]);

  const clearSelection = useCallback(() => {
    setSelectedImageIds([]);
  }, []);

  const openConfigModal = useCallback((image: DockerImage) => {
    dispatch(dockerLabSlice.actions.openConfigModal(image));
  }, [dispatch]);

  const closeConfigModal = useCallback(() => {
    dispatch(dockerLabSlice.actions.closeConfigModal());
  }, [dispatch]);

  const updateActiveConfig = useCallback((patch: Partial<ContainerConfig>) => {
    dispatch(dockerLabSlice.actions.updateActiveConfig(patch));
  }, [dispatch]);

  const executeImage = useCallback(async (config: ContainerConfig, imageId?: string) => {
    const targetId = imageId || config.imageId;
    setExecutingImageId(targetId);
    dispatch(dockerLabSlice.actions.executeRequested(config));

    try {
      const res = await adapter.executeImage(config);
      if (res && res.containers && res.containers.length > 0) {
        const spawnedContainer = res.containers[0];
        dispatch(dockerLabSlice.actions.executeSucceeded(res));
        if (spawnedContainer.containerId) {
          router.push(`/docker-lab/workspace/${spawnedContainer.containerId}`);
        }
      } else {
        dispatch(dockerLabSlice.actions.executeFailed("Failed to spawn container"));
      }
    } catch (err: any) {
      dispatch(dockerLabSlice.actions.executeFailed(err.message || "Execution failed"));
    } finally {
      setExecutingImageId(null);
    }
  }, [dispatch, router]);

  const executeSelectedImages = useCallback(() => {
    selectedImageIds.forEach((id) => {
      const img = DOCKER_IMAGES_CATALOG.find((i) => i.id === id);
      if (img) {
        executeImage(img.defaultConfig, id);
      }
    });
  }, [selectedImageIds, executeImage]);

  const previewSelectedConfig = useCallback(() => {
    const configs = selectedImageIds.map((id) => {
      const img = DOCKER_IMAGES_CATALOG.find((i) => i.id === id);
      return img?.defaultConfig;
    }).filter(Boolean) as ContainerConfig[];

    setPreviewConfigs(configs);
    setIsPreviewOpen(true);
  }, [selectedImageIds]);

  const previewAllActiveConfig = useCallback(() => {
    const configs = Object.values(executions).map((e) => {
      const img = DOCKER_IMAGES_CATALOG.find((i) => i.id === e.imageId);
      return img?.defaultConfig;
    }).filter(Boolean) as ContainerConfig[];

    setPreviewConfigs(configs);
    setIsPreviewOpen(true);
  }, [executions]);

  const testContainer = useCallback((containerId: string, probeType?: string, port?: number, path?: string) => {
    dispatch(dockerLabSlice.actions.testRequested({ containerId, probeType, port, path }));
  }, [dispatch]);

  const fetchLogs = useCallback((containerId: string) => {
    dispatch(dockerLabSlice.actions.logsRequested(containerId));
  }, [dispatch]);

  const stopContainer = useCallback((containerId: string, backup: boolean = false) => {
    dispatch(dockerLabSlice.actions.stopRequested({ containerId, backup }));
  }, [dispatch]);

  const setActiveContainerId = useCallback((containerId: string | null) => {
    dispatch(dockerLabSlice.actions.setActiveContainerId(containerId));
  }, [dispatch]);

  return {
    catalog,
    selectedCategory,
    searchQuery,
    configuredImage,
    activeConfig,
    executions,
    testResults,
    containerLogs,
    activeContainerId,
    runningContainers,
    status,
    error,
    isLoading: status === "loading",
    selectedImageIds,
    executingImageId,
    isPreviewOpen,
    previewConfigs,
    setIsPreviewOpen,
    setCategory,
    setSearchQuery,
    toggleSelectImage,
    selectAll,
    clearSelection,
    openConfigModal,
    closeConfigModal,
    updateActiveConfig,
    executeImage,
    executeSelectedImages,
    previewSelectedConfig,
    previewAllActiveConfig,
    testContainer,
    fetchLogs,
    stopContainer,
    setActiveContainerId,
  };
}
