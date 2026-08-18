import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/core/store/configure-store";

export const selectFileExplorerState = (state: RootState) => state.fileExplorer;

export const selectIsLaunched = createSelector(
  [selectFileExplorerState],
  (state) => state?.isLaunched ?? false
);

export const selectTreeData = createSelector(
  [selectFileExplorerState],
  (state) => state?.treeData ?? []
);

export const selectActiveTemplateId = createSelector(
  [selectFileExplorerState],
  (state) => state?.activeTemplateId ?? ""
);

export const selectSelectedNodeId = createSelector(
  [selectFileExplorerState],
  (state) => state?.selectedNodeId ?? null
);

export const selectExpandedNodeIds = createSelector(
  [selectFileExplorerState],
  (state) => state?.expandedNodeIds ?? []
);

export const selectOpenTabs = createSelector(
  [selectFileExplorerState],
  (state) => state?.openTabs ?? []
);

export const selectActiveTabId = createSelector(
  [selectFileExplorerState],
  (state) => state?.activeTabId ?? null
);

export const selectSearchQuery = createSelector(
  [selectFileExplorerState],
  (state) => state?.searchQuery ?? ""
);

export const selectIsServerRunning = createSelector(
  [selectFileExplorerState],
  (state) => state?.isServerRunning ?? false
);

export const selectTerminalLogs = createSelector(
  [selectFileExplorerState],
  (state) => state?.terminalLogs ?? []
);

export const selectTestResponse = createSelector(
  [selectFileExplorerState],
  (state) => state?.testResponse ?? null
);

export const selectIsSaving = createSelector(
  [selectFileExplorerState],
  (state) => state?.isSaving ?? false
);

export const selectSaveSuccessMessage = createSelector(
  [selectFileExplorerState],
  (state) => state?.saveSuccessMessage ?? null
);

export const selectIsPushingGitHub = createSelector(
  [selectFileExplorerState],
  (state) => state?.isPushingGitHub ?? false
);

export const selectGithubPushResult = createSelector(
  [selectFileExplorerState],
  (state) => state?.githubPushResult ?? null
);

export const selectActiveTab = createSelector(
  [selectOpenTabs, selectActiveTabId],
  (tabs, activeId) => tabs.find((t: { id: string; name: string; path: string; content?: string }) => t.id === activeId) ?? null
);
