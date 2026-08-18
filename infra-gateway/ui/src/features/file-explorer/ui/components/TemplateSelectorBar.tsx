import React from "react";
import { FolderTree, RotateCcw, Plus, Download, FileCode2, Play } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTreeData } from "../../state/file-explorer.selectors";
import { PROJECT_TEMPLATES_CATALOG } from "../../domain/project-templates.catalog";
import { generateSetupShellScript, triggerFileDownload } from "../../utils/download-structure.utils";

interface TemplateSelectorBarProps {
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onOpenCreateModal: () => void;
  onResetLauncher: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  nodeCount: number;
}

export const TemplateSelectorBar: React.FC<TemplateSelectorBarProps> = ({
  activeTemplateId,
  onSelectTemplate,
  onOpenCreateModal,
  onResetLauncher,
  onToggleTerminal,
  isTerminalOpen,
  nodeCount,
}) => {
  const treeData = useSelector(selectTreeData);

  const activeTemplate =
    PROJECT_TEMPLATES_CATALOG.find((t) => t.id === activeTemplateId) ||
    PROJECT_TEMPLATES_CATALOG[0];

  const handleDownloadShellScript = () => {
    const script = generateSetupShellScript(treeData, activeTemplate.rootFolderName);
    triggerFileDownload(`${activeTemplate.rootFolderName}-setup.sh`, script, "application/x-sh");
  };

  const handleDownloadJsonBlueprint = () => {
    const jsonStr = JSON.stringify(treeData, null, 2);
    triggerFileDownload(`${activeTemplate.rootFolderName}-blueprint.json`, jsonStr, "application/json");
  };

  return (
    <div className="h-12 border-b border-[#2b2b2b] bg-[#1f1f1f] px-4 flex items-center justify-between text-xs text-[#cccccc]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-white">
          <FolderTree className="h-4 w-4 text-blue-400" />
          <span>Active Architecture:</span>
        </div>

        <select
          value={activeTemplateId}
          onChange={(e) => onSelectTemplate(e.target.value)}
          className="bg-[#2a2d2e] border border-blue-500/40 text-white rounded px-2.5 py-1 text-xs outline-none focus:border-blue-400 font-medium cursor-pointer"
        >
          {PROJECT_TEMPLATES_CATALOG.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-slate-400 hidden lg:inline">
          {activeTemplate?.description}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">
          {nodeCount} Nodes
        </span>

        <button
          type="button"
          onClick={onToggleTerminal}
          className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded transition-all shadow-md ${
            isTerminalOpen
              ? "bg-blue-600 text-white border border-blue-400 cursor-pointer"
              : "bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse cursor-pointer"
          }`}
          title="Open interactive Server Execution Terminal"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isTerminalOpen ? "Terminal Active" : "Run Server"}</span>
        </button>

        <button
          type="button"
          onClick={onResetLauncher}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-blue-400" />
          <span>Options</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New File/Folder</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadShellScript}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors shadow-sm cursor-pointer"
          title="Download executable Bash script that generates full folder tree and code files"
        >
          <Download className="h-3.5 w-3.5" />
          <span>.sh Script</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJsonBlueprint}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2d2e] hover:bg-[#37373d] text-slate-200 rounded font-medium border border-white/10 transition-colors cursor-pointer"
          title="Download tree JSON blueprint"
        >
          <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
};
