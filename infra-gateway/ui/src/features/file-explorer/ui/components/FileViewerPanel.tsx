import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ChevronRight, FileCode, Save, CheckCircle2, Loader2 } from "lucide-react";
import { FileIconRenderer } from "./FileIconRenderer";
import { detectBadgeKind } from "../../domain/entities/file-node.entity";
import {
  selectIsSaving,
  selectSaveSuccessMessage,
} from "../../readModels/file-explorer.selectors";
import { saveFileAction } from "../../state/file-explorer.slice";
import { highlightLineToTokens } from "../../utils/syntax-highlighter";

interface FileViewerPanelProps {
  openTabs: { id: string; name: string; path: string; content?: string }[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
}

export const FileViewerPanel: React.FC<FileViewerPanelProps> = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onUpdateContent,
}) => {
  const dispatch = useDispatch();

  const isSaving = useSelector(selectIsSaving);
  const saveSuccessMessage = useSelector(selectSaveSuccessMessage);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleSave = () => {
    if (activeTab) {
      dispatch(
        saveFileAction({
          fileId: activeTab.id,
          name: activeTab.name,
          path: activeTab.path,
          content: activeTab.content || "",
        })
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  if (!activeTab || openTabs.length === 0) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col items-center justify-center text-slate-500 select-none">
        <FileCode className="h-16 w-16 stroke-1 text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-400">No File Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
          Select a file from the OpenVSCode Explorer tree on the left to edit code directly with syntax highlighting and save to MongoDB.
        </p>
      </div>
    );
  }

  const lines = (activeTab.content || "").split("\n");
  const pathParts = activeTab.path.split("/");
  const badge = detectBadgeKind(activeTab.name, false);

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col h-full min-w-0">
      <div className="h-9 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between px-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center">
          {openTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const tabBadge = detectBadgeKind(tab.name, false);
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group h-9 px-3 flex items-center gap-2 border-r border-[#2b2b2b] text-xs font-mono cursor-pointer shrink-0 transition-colors ${
                  isActive
                    ? "bg-[#1e1e1e] text-white border-t-2 border-t-blue-500 font-medium"
                    : "bg-[#2d2d2d] text-slate-400 hover:bg-[#1e1e1e] hover:text-slate-200"
                }`}
              >
                <FileIconRenderer badge={tabBadge} isFolder={false} className="h-3.5 w-3.5" />
                <span className="truncate max-w-[140px]">{tab.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-700 p-0.5 rounded text-slate-400 hover:text-white transition-opacity cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMessage && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{saveSuccessMessage}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Save changes to MongoDB (Ctrl+S / Cmd+S)"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save (Ctrl+S)"}</span>
          </button>
        </div>
      </div>

      <div className="h-7 px-4 border-b border-[#2b2b2b] bg-[#1e1e1e] flex items-center text-xs font-mono text-slate-400 gap-1 overflow-x-auto">
        <FileIconRenderer badge={badge} isFolder={false} className="h-3.5 w-3.5 mr-1" />
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
            <span
              className={
                index === pathParts.length - 1
                  ? "text-slate-200 font-semibold truncate"
                  : "truncate hover:text-slate-200 cursor-pointer"
              }
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden font-mono text-xs text-slate-200 leading-6 bg-[#1e1e1e]">
        <div className="w-12 py-3 bg-[#1e1e1e] border-r border-white/5 text-right pr-3 select-none text-slate-600 shrink-0 font-mono">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 pointer-events-none overflow-hidden font-mono text-xs leading-6 text-slate-100 whitespace-pre custom-scrollbar"
          >
            {lines.map((line, idx) => (
              <div key={idx} className="h-6">
                {highlightLineToTokens(line)}
              </div>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={activeTab.content || ""}
            onChange={(e) => onUpdateContent(activeTab.id, e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 p-3 w-full h-full bg-transparent text-transparent caret-white font-mono text-xs leading-6 outline-none resize-none focus:ring-0 border-none font-medium custom-scrollbar whitespace-pre"
            placeholder="// Type code here..."
          />
        </div>
      </div>
    </div>
  );
};
