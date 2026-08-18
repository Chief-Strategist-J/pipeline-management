import React, { useState, useMemo } from "react";
import { X, GitCompare, FileCode, CheckCircle2 } from "lucide-react";
import { computeLineDiff } from "../../utils/diff.utils";

interface FileDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  originalContent?: string;
  currentContent?: string;
}

export const FileDiffModal: React.FC<FileDiffModalProps> = ({
  isOpen,
  onClose,
  fileName,
  filePath,
  originalContent = "",
  currentContent = "",
}) => {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  const diffLines = useMemo(() => {
    return computeLineDiff(originalContent, currentContent);
  }, [originalContent, currentContent]);

  if (!isOpen) return null;

  const additions = diffLines.filter((l) => l.type === "add").length;
  const deletions = diffLines.filter((l) => l.type === "delete").length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 font-mono text-xs">
        <div className="h-11 bg-[#252526] px-4 border-b border-[#3c3c3c] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-semibold truncate">
            <GitCompare className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="truncate">{fileName}</span>
            <span className="text-[10px] text-slate-400 font-normal truncate">({filePath})</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-emerald-400 font-bold">+{additions}</span>
              <span className="text-rose-400 font-bold">-{deletions}</span>
            </div>

            <div className="flex items-center bg-[#1e1e1e] rounded border border-[#3c3c3c] p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  viewMode === "unified" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Unified
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  viewMode === "split" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Split
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#181818] p-3">
          {viewMode === "unified" ? (
            <div className="divide-y divide-[#222222]">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-center px-2 py-0.5 leading-relaxed font-mono whitespace-pre ${
                    line.type === "add"
                      ? "bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500"
                      : line.type === "delete"
                      ? "bg-rose-950/60 text-rose-300 border-l-2 border-rose-500"
                      : "text-slate-300"
                  }`}
                >
                  <span className="w-8 select-none text-slate-500 text-right pr-2 shrink-0">
                    {line.oldLineNumber || ""}
                  </span>
                  <span className="w-8 select-none text-slate-500 text-right pr-2 shrink-0 border-r border-[#333333] mr-2">
                    {line.newLineNumber || ""}
                  </span>
                  <span className="w-4 select-none shrink-0 font-bold">
                    {line.type === "add" ? "+" : line.type === "delete" ? "-" : " "}
                  </span>
                  <span className="flex-1 truncate">{line.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="bg-[#1e1e1e] border border-[#333333] rounded p-2 overflow-x-auto">
                <div className="text-[10px] text-slate-400 font-bold mb-2 pb-1 border-b border-[#333333] flex items-center gap-1">
                  <FileCode className="h-3 w-3 text-slate-400" />
                  <span>Original Template Baseline</span>
                </div>
                {diffLines
                  .filter((l) => l.type !== "add")
                  .map((l, idx) => (
                    <div
                      key={idx}
                      className={`px-1 py-0.5 whitespace-pre ${
                        l.type === "delete" ? "bg-rose-950/70 text-rose-300" : "text-slate-300"
                      }`}
                    >
                      <span className="inline-block w-6 text-slate-500 select-none mr-2">{l.oldLineNumber}</span>
                      <span>{l.content}</span>
                    </div>
                  ))}
              </div>

              <div className="bg-[#1e1e1e] border border-[#333333] rounded p-2 overflow-x-auto">
                <div className="text-[10px] text-slate-400 font-bold mb-2 pb-1 border-b border-[#333333] flex items-center gap-1">
                  <FileCode className="h-3 w-3 text-purple-400" />
                  <span>Modified Current Working File</span>
                </div>
                {diffLines
                  .filter((l) => l.type !== "delete")
                  .map((l, idx) => (
                    <div
                      key={idx}
                      className={`px-1 py-0.5 whitespace-pre ${
                        l.type === "add" ? "bg-emerald-950/70 text-emerald-300" : "text-slate-300"
                      }`}
                    >
                      <span className="inline-block w-6 text-slate-500 select-none mr-2">{l.newLineNumber}</span>
                      <span>{l.content}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-9 bg-[#252526] px-4 border-t border-[#3c3c3c] flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Line Diff Computed ({diffLines.length} total lines)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#3c3c3c] hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors cursor-pointer"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};
