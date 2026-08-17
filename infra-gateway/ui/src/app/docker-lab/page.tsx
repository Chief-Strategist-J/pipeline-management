"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { Download, FileCode, Play, Layers } from "lucide-react";
import {
  useDockerLab,
  ImageCatalog,
  ExecutionPanel,
  ConfigureModal,
  ConfigPreviewModal
} from "@/features/docker-lab";

export default function DockerLabPage() {
  const {
    catalog,
    selectedCategory,
    searchQuery,
    configuredImage,
    activeConfig,
    runningContainers,
    testResults,
    containerLogs,
    activeContainerId,
    isLoading,
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
    executeImage,
    executeSelectedImages,
    previewSelectedConfig,
    previewAllActiveConfig,
    testContainer,
    fetchLogs,
    stopContainer,
    setActiveContainerId,
  } = useDockerLab();

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>🧪</span> Docker Infrastructure Lab & Execution Sandbox
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute, test, and preview configurations for 47+ production Docker images directly on this system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {runningContainers.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={previewAllActiveConfig}
            >
              <FileCode className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Preview Active Stack ({runningContainers.length})
            </Button>
          )}

          {selectedImageIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={previewSelectedConfig}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Preview Selected ({selectedImageIds.length})
            </Button>
          )}
        </div>
      </div>

      <ExecutionPanel
        runningContainers={runningContainers}
        activeContainerId={activeContainerId}
        testResults={testResults}
        containerLogs={containerLogs}
        onSelectContainer={setActiveContainerId}
        onTestContainer={testContainer}
        onFetchLogs={fetchLogs}
        onStopContainer={stopContainer}
        isLoading={isLoading}
      />

      <ImageCatalog
        catalog={catalog}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        runningContainers={runningContainers}
        selectedImageIds={selectedImageIds}
        executingImageId={executingImageId}
        onSelectCategory={setCategory}
        onSearchChange={setSearchQuery}
        onToggleSelectImage={toggleSelectImage}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onConfigure={openConfigModal}
        onQuickExecute={executeImage}
        onExecuteSelected={executeSelectedImages}
        onPreviewSelectedConfig={previewSelectedConfig}
        isLoading={isLoading}
      />

      <ConfigureModal
        isOpen={!!configuredImage}
        image={configuredImage}
        config={activeConfig}
        onClose={closeConfigModal}
        onExecute={executeImage}
        isLoading={isLoading}
      />

      <ConfigPreviewModal
        isOpen={isPreviewOpen}
        configs={previewConfigs}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
