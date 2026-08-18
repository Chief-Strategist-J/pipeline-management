import React from "react";
import { Files, GitBranch, Search, Settings, LayoutGrid } from "lucide-react";

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
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          type="button"
          onClick={() => onSelectView("explorer")}
          className={`w-full py-2.5 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeView === "explorer"
              ? "text-white border-l-2 border-blue-500 bg-[#252526]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="File Explorer (Ctrl+Shift+E)"
        >
          <Files className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => onSelectView("sourceControl")}
          className={`w-full py-2.5 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeView === "sourceControl"
              ? "text-white border-l-2 border-blue-500 bg-[#252526]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Source Control & Git Graph (Ctrl+Shift+G)"
        >
          <GitBranch className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-4 min-w-[16px] px-1 bg-blue-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
            1
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenGrid}
          className="w-full py-2.5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Architecture Gallery Grid"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="w-full py-2.5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Search Code"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <button
          type="button"
          className="w-full py-2.5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="IDE Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
