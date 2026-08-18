import React, { useState } from "react";
import {
  FilePlus,
  FolderPlus,
  Minimize2,
  Maximize2,
  Search,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { FileTreeNode } from "./FileTreeNode";
import type { TreeItem } from "../../domain/entities/file-node.entity";

interface FileExplorerSidebarProps {
  treeData: TreeItem[];
  expandedNodeIds: string[];
  selectedNodeId: string | null;
  searchQuery: string;
  onToggleExpand: (nodeId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSelectNode: (nodeId: string) => void;
  onCreateNode: (payload: { name: string; type: "file" | "folder"; parentId?: string }) => void;
  onDeleteNode: (nodeId: string) => void;
  onSearchChange: (query: string) => void;
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  treeData,
  expandedNodeIds,
  selectedNodeId,
  searchQuery,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onSelectNode,
  onCreateNode,
  onDeleteNode,
  onSearchChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isCreatingRoot, setIsCreatingRoot] = useState<"file" | "folder" | null>(null);
  const [rootItemName, setRootItemName] = useState("");

  const handleRootCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (rootItemName.trim() && isCreatingRoot) {
      onCreateNode({
        name: rootItemName.trim(),
        type: isCreatingRoot,
        parentId: selectedNodeId || undefined,
      });
      setRootItemName("");
      setIsCreatingRoot(null);
    }
  };

  return (
    <div className="w-80 border-r border-[#2b2b2b] bg-[#181818] text-[#cccccc] flex flex-col h-full shrink-0 select-none">
      <div className="h-9 px-3 border-b border-[#2b2b2b] flex items-center justify-between bg-[#252526] text-xs font-semibold tracking-wider text-slate-300">
        <span className="truncate">EXPLORER</span>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            title="Toggle Search Filter"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 hover:text-white rounded cursor-pointer ${showSearch ? "text-blue-400" : ""}`}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            title="New File"
            onClick={() => setIsCreatingRoot("file")}
            className="p-1 hover:text-white rounded cursor-pointer"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            title="New Folder"
            onClick={() => setIsCreatingRoot("folder")}
            className="p-1 hover:text-white rounded cursor-pointer"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            title="Collapse All"
            onClick={onCollapseAll}
            className="p-1 hover:text-white rounded cursor-pointer"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            title="Expand All"
            onClick={onExpandAll}
            className="p-1 hover:text-white rounded cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button title="More Actions" className="p-1 hover:text-white rounded cursor-pointer">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="p-2 border-b border-[#2b2b2b] bg-[#1e1e1e]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#2a2d2e] border border-white/10 text-white text-xs px-2 py-1 pl-7 rounded outline-none font-mono focus:border-blue-500"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#181818]">
        <div className="flex items-center gap-1">
          <ChevronDown className="h-3 w-3" />
          <span>WORKSPACE</span>
        </div>
      </div>

      {isCreatingRoot && (
        <form onSubmit={handleRootCreate} className="p-2 border-b border-[#2b2b2b] bg-[#1e1e1e]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-blue-400">
              {isCreatingRoot === "folder" ? "[DIR]" : "[FILE]"}
            </span>
            <input
              autoFocus
              type="text"
              placeholder={isCreatingRoot === "folder" ? "new_folder" : "new_file.ts"}
              value={rootItemName}
              onChange={(e) => setRootItemName(e.target.value)}
              onBlur={() => setIsCreatingRoot(null)}
              className="w-full bg-[#2a2d2e] border border-blue-500 text-white text-xs px-2 py-1 rounded outline-none font-mono"
            />
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
        {treeData.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            depth={0}
            expandedNodeIds={expandedNodeIds}
            selectedNodeId={selectedNodeId}
            searchQuery={searchQuery}
            onToggleExpand={onToggleExpand}
            onSelectNode={onSelectNode}
            onCreateChild={(parentId, type, name) => onCreateNode({ parentId, type, name })}
            onDeleteNode={onDeleteNode}
          />
        ))}
      </div>
    </div>
  );
};
