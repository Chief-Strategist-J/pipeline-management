import React, { useState } from "react";
import { ChevronRight, ChevronDown, Plus, FolderPlus, Trash2 } from "lucide-react";
import { FileIconRenderer } from "./FileIconRenderer";
import { isFolder as checkIsFolder, type TreeItem } from "../../domain/entities/file-node.entity";

interface FileTreeNodeProps {
  node: TreeItem;
  depth?: number;
  expandedNodeIds: string[];
  selectedNodeId: string | null;
  searchQuery: string;
  onToggleExpand: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onCreateChild: (parentId: string, type: "file" | "folder", name: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth = 0,
  expandedNodeIds,
  selectedNodeId,
  searchQuery,
  onToggleExpand,
  onSelectNode,
  onCreateChild,
  onDeleteNode,
}) => {
  const isFolderNode = checkIsFolder(node);
  const children = isFolderNode ? node.children : [];

  const isExpanded = isFolderNode ? expandedNodeIds.includes(node.id) : false;
  const isSelected = selectedNodeId === node.id;

  const [isAdding, setIsAdding] = useState<"file" | "folder" | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const isMatchingSearch =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.path.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isMatchingSearch && !isFolderNode) {
    return null;
  }

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node.id);
    if (isFolderNode) {
      onToggleExpand(node.id);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() && isAdding) {
      onCreateChild(node.id, isAdding, newItemName.trim());
      setNewItemName("");
      setIsAdding(null);
    }
  };

  const paddingLeft = depth * 14 + 8;

  return (
    <div className="select-none font-mono text-[13px] leading-6 tracking-normal">
      <div
        onClick={handleRowClick}
        style={{ paddingLeft: `${paddingLeft}px` }}
        className={`group relative flex items-center justify-between py-[2px] pr-2 cursor-pointer transition-colors duration-100 font-mono ${
          isSelected
            ? "bg-[#37373d] text-white font-medium shadow-sm"
            : "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
        }`}
      >
        {depth > 0 &&
          Array.from({ length: depth }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 border-l border-white/5 pointer-events-none"
              style={{ left: `${i * 14 + 14}px` }}
            />
          ))}

        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden pr-2 font-mono">
          {isFolderNode ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 text-slate-400 hover:text-white shrink-0 rounded cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-blue-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          <FileIconRenderer
            badge={node.badge}
            isFolder={isFolderNode}
            isOpen={isExpanded}
            className="h-4 w-4 shrink-0"
          />

          <span
            className={`truncate font-mono text-[13px] ${
              isSelected ? "text-white font-semibold" : "text-[#cccccc] group-hover:text-white"
            }`}
          >
            {node.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 bg-[#2a2d2e]/90 rounded px-1">
          {isFolderNode && (
            <>
              <button
                type="button"
                title="New File"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                  if (!isExpanded) onToggleExpand(node.id);
                  setIsAdding("file");
                }}
                className="p-0.5 hover:text-blue-400 text-slate-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="New Folder"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                  if (!isExpanded) onToggleExpand(node.id);
                  setIsAdding("folder");
                }}
                className="p-0.5 hover:text-amber-400 text-slate-400 transition-colors"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {depth > 0 && (
            <button
              type="button"
              title="Delete Item"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              className="p-0.5 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          style={{ paddingLeft: `${paddingLeft + 20}px` }}
          className="py-1 pr-2 flex items-center gap-1.5 bg-[#1e1e1e]"
        >
          <FileIconRenderer
            isFolder={isAdding === "folder"}
            badge={isAdding === "folder" ? "folder" : "code"}
            className="h-3.5 w-3.5"
          />
          <input
            autoFocus
            type="text"
            placeholder={isAdding === "folder" ? "folder_name" : "file_name.ts"}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={() => setIsAdding(null)}
            className="bg-[#2a2d2e] border border-blue-500 text-white text-xs px-1.5 py-0.5 rounded outline-none w-full font-mono"
          />
        </form>
      )}

      {isFolderNode && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodeIds={expandedNodeIds}
              selectedNodeId={selectedNodeId}
              searchQuery={searchQuery}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
              onCreateChild={onCreateChild}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
