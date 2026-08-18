import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TreeItem,
  FolderNode,
  FileNode,
  detectBadgeKind,
  isFile,
} from "../domain/entities/file-node.entity";
import {
  OPENVSCODE_PIPELINE_TEMPLATE,
  PROJECT_TEMPLATES_CATALOG,
} from "../domain/project-templates.catalog";

export interface FileExplorerState {
  isLaunched: boolean;
  activeTemplateId: string;
  treeData: TreeItem[];
  selectedNodeId: string | null;
  expandedNodeIds: string[];
  openTabs: { id: string; name: string; path: string; content?: string }[];
  activeTabId: string | null;
  searchQuery: string;
  isServerRunning: boolean;
  terminalLogs: string[];
  testResponse: string | null;
  isSaving: boolean;
  saveSuccessMessage: string | null;
  isPushingGitHub: boolean;
  githubPushResult: { success: boolean; repoUrl?: string; message: string } | null;
}

const initialState: FileExplorerState = {
  isLaunched: false,
  activeTemplateId: OPENVSCODE_PIPELINE_TEMPLATE.id,
  treeData: [],
  selectedNodeId: null,
  expandedNodeIds: [],
  openTabs: [],
  activeTabId: null,
  searchQuery: "",
  isServerRunning: false,
  terminalLogs: [],
  testResponse: null,
  isSaving: false,
  saveSuccessMessage: null,
  isPushingGitHub: false,
  githubPushResult: null,
};

function collectAllFolderIds(nodes: TreeItem[]): string[] {
  let ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      ids.push(node.id);
      ids = ids.concat(collectAllFolderIds(node.children));
    }
  }
  return ids;
}

function findFirstFileNode(nodes: TreeItem[]): FileNode | null {
  for (const node of nodes) {
    if (node.type === "file") return node;
    if (node.type === "folder") {
      const found = findFirstFileNode(node.children);
      if (found) return found;
    }
  }
  return null;
}

function findNodeById(nodes: TreeItem[], id: string): TreeItem | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "folder") {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNodeRecursively(nodes: TreeItem[], id: string): boolean {
  const index = nodes.findIndex((n) => n.id === id);
  if (index !== -1) {
    nodes.splice(index, 1);
    return true;
  }
  for (const node of nodes) {
    if (node.type === "folder") {
      const removed = removeNodeRecursively(node.children, id);
      if (removed) return true;
    }
  }
  return false;
}

export const fileExplorerSlice = createSlice({
  name: "fileExplorer",
  initialState,
  reducers: {
    launchWorkspace(
      state,
      action: PayloadAction<{ templateId: string; customTree?: TreeItem[] }>
    ) {
      const { templateId, customTree } = action.payload;
      const template = PROJECT_TEMPLATES_CATALOG.find((t) => t.id === templateId);
      const tree = customTree || template?.tree || [];

      state.isLaunched = true;
      state.activeTemplateId = templateId;
      state.treeData = tree;
      state.expandedNodeIds = collectAllFolderIds(tree);

      const firstFile = findFirstFileNode(tree);
      if (firstFile) {
        state.selectedNodeId = firstFile.id;
        state.openTabs = [
          {
            id: firstFile.id,
            name: firstFile.name,
            path: firstFile.path,
            content: firstFile.content,
          },
        ];
        state.activeTabId = firstFile.id;
      } else {
        state.selectedNodeId = tree[0]?.id ?? null;
        state.openTabs = [];
        state.activeTabId = null;
      }

      state.isServerRunning = false;
      state.terminalLogs = [];
      state.testResponse = null;
      state.isSaving = false;
      state.saveSuccessMessage = null;
      state.isPushingGitHub = false;
      state.githubPushResult = null;
    },
    resetLauncher(state) {
      state.isLaunched = false;
    },
    selectTemplate(state, action: PayloadAction<string>) {
      const template = PROJECT_TEMPLATES_CATALOG.find((t) => t.id === action.payload);
      if (template) {
        state.activeTemplateId = template.id;
        state.treeData = template.tree;
        state.expandedNodeIds = collectAllFolderIds(template.tree);

        const firstFile = findFirstFileNode(template.tree);
        if (firstFile) {
          state.selectedNodeId = firstFile.id;
          state.openTabs = [
            {
              id: firstFile.id,
              name: firstFile.name,
              path: firstFile.path,
              content: firstFile.content,
            },
          ];
          state.activeTabId = firstFile.id;
        } else {
          state.selectedNodeId = template.tree[0]?.id ?? null;
          state.openTabs = [];
          state.activeTabId = null;
        }

        state.isServerRunning = false;
        state.terminalLogs = [];
        state.testResponse = null;
        state.isSaving = false;
        state.saveSuccessMessage = null;
        state.isPushingGitHub = false;
        state.githubPushResult = null;
      }
    },

    toggleExpandNode(state, action: PayloadAction<string>) {
      const nodeId = action.payload;
      if (state.expandedNodeIds.includes(nodeId)) {
        state.expandedNodeIds = state.expandedNodeIds.filter((id) => id !== nodeId);
      } else {
        state.expandedNodeIds.push(nodeId);
      }
    },
    expandAll(state) {
      state.expandedNodeIds = collectAllFolderIds(state.treeData);
    },
    collapseAll(state) {
      state.expandedNodeIds = [];
    },

    selectNode(state, action: PayloadAction<string>) {
      const nodeId = action.payload;
      state.selectedNodeId = nodeId;

      const node = findNodeById(state.treeData, nodeId);
      if (node && isFile(node)) {
        const existingTab = state.openTabs.find((t) => t.id === node.id);
        if (!existingTab) {
          state.openTabs.push({
            id: node.id,
            name: node.name,
            path: node.path,
            content: node.content,
          });
        }
        state.activeTabId = node.id;
      }
    },

    createNode(
      state,
      action: PayloadAction<{
        name: string;
        type: "file" | "folder";
        content?: string;
        parentId?: string;
      }>
    ) {
      const { name, type, content = "", parentId } = action.payload;
      const targetParentId = parentId || state.selectedNodeId || state.treeData[0]?.id;
      const parentNode = targetParentId ? findNodeById(state.treeData, targetParentId) : null;
      const basePath = parentNode ? parentNode.path : "root";
      const newPath = `${basePath}/${name}`;
      const badge = detectBadgeKind(name, type === "folder");

      const newNode: TreeItem =
        type === "folder"
          ? {
              id: `folder-${Date.now()}`,
              name,
              type: "folder",
              path: newPath,
              parentId: parentNode?.id || null,
              badge,
              children: [],
              isExpanded: true,
            }
          : {
              id: `file-${Date.now()}`,
              name,
              type: "file",
              path: newPath,
              parentId: parentNode?.id || null,
              badge,
              content,
            };

      if (parentNode && parentNode.type === "folder") {
        parentNode.children.push(newNode);
        if (!state.expandedNodeIds.includes(parentNode.id)) {
          state.expandedNodeIds.push(parentNode.id);
        }
      } else {
        state.treeData.push(newNode);
      }

      if (newNode.type === "file") {
        state.openTabs.push({
          id: newNode.id,
          name: newNode.name,
          path: newNode.path,
          content: newNode.content,
        });
        state.activeTabId = newNode.id;
        state.selectedNodeId = newNode.id;
      }
    },

    deleteNode(state, action: PayloadAction<string>) {
      const id = action.payload;
      removeNodeRecursively(state.treeData, id);
      state.openTabs = state.openTabs.filter((t) => t.id !== id);
      if (state.activeTabId === id) {
        state.activeTabId = state.openTabs[state.openTabs.length - 1]?.id || null;
      }
      if (state.selectedNodeId === id) {
        state.selectedNodeId = null;
      }
    },

    closeTab(state, action: PayloadAction<string>) {
      const tabId = action.payload;
      state.openTabs = state.openTabs.filter((t) => t.id !== tabId);
      if (state.activeTabId === tabId) {
        state.activeTabId = state.openTabs[state.openTabs.length - 1]?.id || null;
      }
    },

    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTabId = action.payload;
    },

    updateFileContent(
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) {
      const { id, content } = action.payload;
      const tab = state.openTabs.find((t) => t.id === id);
      if (tab) tab.content = content;

      const node = findNodeById(state.treeData, id);
      if (node && isFile(node)) {
        node.content = content;
      }
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },

    setServerRunning(state, action: PayloadAction<boolean>) {
      state.isServerRunning = action.payload;
    },
    appendTerminalLog(state, action: PayloadAction<string>) {
      state.terminalLogs.push(action.payload);
    },
    clearTerminalLogs(state) {
      state.terminalLogs = [];
    },
    setTestResponse(state, action: PayloadAction<string | null>) {
      state.testResponse = action.payload;
    },

    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    setSaveSuccessMessage(state, action: PayloadAction<string | null>) {
      state.saveSuccessMessage = action.payload;
    },

    setIsPushingGitHub(state, action: PayloadAction<boolean>) {
      state.isPushingGitHub = action.payload;
    },
    setGithubPushResult(state, action: PayloadAction<{ success: boolean; repoUrl?: string; message: string } | null>) {
      state.githubPushResult = action.payload;
    },

    startServerAction(_state, _action: PayloadAction<{ templateId: string }>) {},
    stopServerAction(_state, _action: PayloadAction<{ templateId: string }>) {},
    sendTestRequestAction(_state, _action: PayloadAction<{ templateId: string }>) {},
    saveFileAction(_state, _action: PayloadAction<{ fileId: string; name: string; path: string; content: string }>) {},
    pushToGitHubAction(_state, _action: PayloadAction<{ token: string; repoName: string; branchName?: string; commitMessage: string; isPrivate?: boolean; treeData?: TreeItem[] }>) {},
  },
});

export const {
  launchWorkspace,
  resetLauncher,
  selectTemplate,
  toggleExpandNode,
  expandAll,
  collapseAll,
  selectNode,
  createNode,
  deleteNode,
  closeTab,
  setActiveTab,
  updateFileContent,
  setSearchQuery,
  setServerRunning,
  appendTerminalLog,
  clearTerminalLogs,
  setTestResponse,
  setIsSaving,
  setSaveSuccessMessage,
  setIsPushingGitHub,
  setGithubPushResult,
  startServerAction,
  stopServerAction,
  sendTestRequestAction,
  saveFileAction,
  pushToGitHubAction,
} = fileExplorerSlice.actions;

export default fileExplorerSlice.reducer;
