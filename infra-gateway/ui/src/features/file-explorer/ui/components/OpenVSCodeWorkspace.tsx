import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsLaunched,
  selectActiveTemplateId,
  selectTreeData,
  selectSelectedNodeId,
  selectExpandedNodeIds,
  selectOpenTabs,
  selectActiveTabId,
  selectSearchQuery,
  selectIsServerRunning,
} from "../../readModels/file-explorer.selectors";
import {
  selectNode,
  toggleExpandNode,
  expandAll,
  collapseAll,
  closeTab,
  setActiveTab,
  updateFileContent,
  createNode,
  deleteNode,
  setSearchQuery,
  startServerAction,
  stopServerAction,
  sendTestRequestAction,
  resetLauncher,
  launchWorkspace,
  selectTemplate,
} from "../../state/file-explorer.slice";
import {
  OPENVSCODE_PIPELINE_TEMPLATE,
  PROJECT_TEMPLATES_CATALOG,
} from "../../domain/project-templates.catalog";
import { FileExplorerSidebar } from "./FileExplorerSidebar";
import { FileViewerPanel } from "./FileViewerPanel";
import { CreateItemModal } from "./CreateItemModal";
import { ServerTerminalDrawer } from "./ServerTerminalDrawer";
import { GitHubPushModal, GitHubIcon } from "./GitHubPushModal";
import { TemplateLauncherScreen } from "./TemplateLauncherScreen";
import { VSCodeActivityBar } from "./VSCodeActivityBar";
import { SourceControlPanel } from "./SourceControlPanel";
import { Play, Square, Send, LayoutGrid, ArrowLeft } from "lucide-react";

export const OpenVSCodeWorkspace: React.FC = () => {
  const dispatch = useDispatch();

  const isLaunched = useSelector(selectIsLaunched);
  const activeTemplateId = useSelector(selectActiveTemplateId);
  const treeData = useSelector(selectTreeData);
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const expandedNodeIds = useSelector(selectExpandedNodeIds);
  const openTabs = useSelector(selectOpenTabs);
  const activeTabId = useSelector(selectActiveTabId);
  const searchQuery = useSelector(selectSearchQuery);
  const isServerRunning = useSelector(selectIsServerRunning);

  const [activeSidebarView, setActiveSidebarView] = useState<"explorer" | "sourceControl">("explorer");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  useEffect(() => {
    if (!isLaunched && treeData.length === 0) {
      dispatch(launchWorkspace({ templateId: OPENVSCODE_PIPELINE_TEMPLATE.id }));
    }
  }, [isLaunched, treeData.length, dispatch]);

  const activeTemplate =
    PROJECT_TEMPLATES_CATALOG.find((t) => t.id === activeTemplateId) ||
    PROJECT_TEMPLATES_CATALOG[0];

  const handleSelectTemplate = (templateId: string) => {
    dispatch(selectTemplate(templateId));
  };

  const handleCreateNode = (name: string, type: "file" | "folder", content?: string) => {
    dispatch(createNode({ name, type, content }));
    setIsModalOpen(false);
  };

  if (!isLaunched) {
    return (
      <div className="w-full h-full p-4 overflow-y-auto bg-[#141414]">
        <TemplateLauncherScreen
          onLaunch={(templateId, customTree) =>
            dispatch(launchWorkspace({ templateId, customTree }))
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-[#1e1e1e] text-slate-100 overflow-hidden font-sans select-none">
      <div className="h-10 bg-[#323233] border-b border-[#2b2b2b] px-3 flex items-center justify-between text-xs font-mono text-slate-300 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(resetLauncher())}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252526] hover:bg-[#3c3c3c] text-slate-200 border border-slate-700 transition-colors font-medium cursor-pointer"
            title="Open Template Architecture Grid View"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Grid View</span>
          </button>

          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-blue-400 shrink-0" />
            <select
              value={activeTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-[#1e1e1e] border border-blue-500/40 text-white rounded px-2.5 py-1 text-xs font-mono outline-none focus:border-blue-400 font-semibold cursor-pointer"
              title="Select folder structure template architecture"
            >
              {PROJECT_TEMPLATES_CATALOG.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id} className="bg-[#252526] text-white">
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isServerRunning ? (
            <button
              type="button"
              onClick={() => dispatch(startServerAction({ templateId: activeTemplateId }))}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-all shadow-sm cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Server</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(stopServerAction({ templateId: activeTemplateId }))}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-all shadow-sm cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop Server</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch(sendTestRequestAction({ templateId: activeTemplateId }))}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-all shadow-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Test API</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold transition-all shadow-sm cursor-pointer ml-1"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            <span>Push to GitHub</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <VSCodeActivityBar
          activeView={activeSidebarView}
          onSelectView={setActiveSidebarView}
          onOpenGrid={() => dispatch(resetLauncher())}
        />

        {activeSidebarView === "explorer" ? (
          <FileExplorerSidebar
            treeData={treeData}
            selectedNodeId={selectedNodeId}
            expandedNodeIds={expandedNodeIds}
            searchQuery={searchQuery}
            onSelectNode={(id) => dispatch(selectNode(id))}
            onToggleExpand={(id) => dispatch(toggleExpandNode(id))}
            onExpandAll={() => dispatch(expandAll())}
            onCollapseAll={() => dispatch(collapseAll())}
            onCreateNode={(payload) => dispatch(createNode(payload))}
            onDeleteNode={(id) => dispatch(deleteNode(id))}
            onSearchChange={(q) => dispatch(setSearchQuery(q))}
          />
        ) : (
          <SourceControlPanel
            onSync={() => setIsGitHubModalOpen(true)}
          />
        )}

        <FileViewerPanel
          openTabs={openTabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => dispatch(setActiveTab(id))}
          onCloseTab={(id) => dispatch(closeTab(id))}
          onUpdateContent={(id, content) => dispatch(updateFileContent({ id, content }))}
        />
      </div>

      <ServerTerminalDrawer
        activeTemplateId={activeTemplateId}
        isOpen={true}
        onToggle={() => {}}
      />

      <CreateItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateNode}
      />

      <GitHubPushModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
};
