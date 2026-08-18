import React from "react";
import { Files, GitBranch, LayoutGrid } from "lucide-react";

interface VSCodeActivityBarProps {
  activeView: "explorer" | "sourceControl";
  onSelectView: (view: "explorer" | "sourceControl") => void;
  onOpenGrid: () => void;
}

export const VSCodeActivityBar: React.FC<VSCodeActivityBarProps> = ({
  activeView,
  onSelectView,
  onOpenGrid,
}) => {
  return (
    <div className="w-12 h-full bg-[#181818] border-r border-[#2b2b2b] flex flex-col items-center justify-between py-2 shrink-0 select-none">
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          type="button"
          onClick={() => onSelectView("explorer")}
          className={`w-full py-3 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeView === "explorer"
              ? "text-white border-l-2 border-blue-500 bg-[#252526]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="File Explorer & Folder Structure"
        >
          <Files className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => onSelectView("sourceControl")}
          className={`w-full py-3 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeView === "sourceControl"
              ? "text-white border-l-2 border-blue-500 bg-[#252526]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Git Branch & Source Control"
        >
          <GitBranch className="h-5 w-5 text-purple-400" />
        </button>

        <button
          type="button"
          onClick={onOpenGrid}
          className="w-full py-3 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Architecture Gallery Grid"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
