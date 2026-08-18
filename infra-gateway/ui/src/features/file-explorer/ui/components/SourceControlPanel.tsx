import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  RefreshCw,
  GitBranch,
  FileCode,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";
import { selectOpenTabs } from "../../readModels/file-explorer.selectors";

interface GitCommitItem {
  shortHash: string;
  fullHash: string;
  subject: string;
  author: string;
  relativeDate: string;
  refs: string;
  repoUrl?: string;
}

interface SourceControlPanelProps {
  onSync: () => void;
  isSyncing?: boolean;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({ onSync, isSyncing }) => {
  const openTabs = useSelector(selectOpenTabs);

  const [isChangesOpen, setIsChangesOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isGitChangesOpen, setIsGitChangesOpen] = useState(true);

  const [commitMsg, setCommitMsg] = useState("");
  const [commits, setCommits] = useState<GitCommitItem[]>([]);
  const [totalCommits, setTotalCommits] = useState<number>(0);
  const [currentBranch, setCurrentBranch] = useState<string>("main");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGitHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/git/history");
      const data = await res.json();
      if (data.success) {
        setCommits(data.commits || []);
        setTotalCommits(data.totalCommits || 0);
        setCurrentBranch(data.currentBranch || "main");
      }
    } catch {
      setCommits([]);
      setTotalCommits(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHistory();
  }, []);

  return (
    <div className="w-80 h-full bg-[#181818] border-r border-[#2b2b2b] text-[#cccccc] flex flex-col font-sans select-none overflow-hidden shrink-0 text-xs">
      <div className="h-9 px-3 bg-[#1e1e1e] border-b border-[#2b2b2b] flex items-center justify-between font-semibold text-slate-200">
        <span className="uppercase tracking-wider text-[11px] font-bold text-[#cccccc]">Source Control</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={fetchGitHistory}
            className="p-1 hover:bg-[#3c3c3c] text-slate-300 rounded cursor-pointer transition-colors"
            title="Refresh Git Push History from MongoDB"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onSync}
            className="p-1 hover:bg-[#3c3c3c] text-slate-300 rounded cursor-pointer transition-colors"
            title="Sync & Push to GitHub"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-[#3c3c3c] text-slate-300 rounded cursor-pointer transition-colors"
            title="More Actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#2b2b2b]">
        <div>
          <div
            onClick={() => setIsChangesOpen(!isChangesOpen)}
            className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#252526] flex items-center justify-between cursor-pointer font-bold text-slate-200 text-xs"
          >
            <div className="flex items-center gap-1.5">
              {isChangesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Commit & Push</span>
            </div>
          </div>

          {isChangesOpen && (
            <div className="p-3 space-y-2.5 bg-[#181818]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder={`Commit message on '${currentBranch}'`}
                  className="w-full bg-[#252526] border border-[#3c3c3c] rounded px-3 py-1.5 pr-8 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-2 p-1 text-blue-400 hover:text-blue-300 rounded cursor-pointer"
                  title="Generate Commit Message with AI"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white py-1.5 rounded font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-xs"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync & Push Changes ↑</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <div
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#252526] flex items-center justify-between cursor-pointer font-bold text-slate-200 text-xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              {isHistoryOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">Git Pushed Commits ({currentBranch})</span>
              <span className="text-[10px] text-slate-400 font-normal shrink-0">({totalCommits} commits)</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <RefreshCw className="h-3 w-3 hover:text-white cursor-pointer" onClick={fetchGitHistory} />
            </div>
          </div>

          {isHistoryOpen && (
            <div className="bg-[#181818] font-mono text-[11px] max-h-64 overflow-y-auto custom-scrollbar">
              {commits.length === 0 ? (
                <div className="p-3 text-[#888888] text-[11px] font-sans flex items-start gap-2 bg-[#151515]">
                  <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-300">No pushes recorded in MongoDB yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Click <strong className="text-blue-400 font-mono">"Sync Changes"</strong> or <strong className="text-purple-400 font-mono">"Push to GitHub"</strong> to push code to branch <strong className="text-emerald-400 font-mono">{currentBranch}</strong>. Pushed commits will appear here in real-time.
                    </p>
                  </div>
                </div>
              ) : (
                commits.map((c, idx) => (
                  <div
                    key={c.shortHash || idx}
                    className={`px-3 py-2 flex items-center gap-2 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#222222] ${
                      idx === 0 ? "bg-[#094771]/50 border-blue-500/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        {c.refs && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] shrink-0 font-bold">
                            {c.refs}
                          </span>
                        )}
                        <span className="text-slate-200 font-medium truncate">{c.subject}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{c.relativeDate}</span>
                        <span>&bull;</span>
                        <span>{c.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-[10px]">
                      <span className="text-cyan-400 font-bold">{c.shortHash}</span>
                      {c.repoUrl && (
                        <a href={c.repoUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <div
            onClick={() => setIsGitChangesOpen(!isGitChangesOpen)}
            className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#252526] flex items-center justify-between cursor-pointer font-bold text-slate-200 text-xs"
          >
            <div className="flex items-center gap-1.5">
              {isGitChangesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Active Open Files ({openTabs.length})</span>
            </div>
          </div>

          {isGitChangesOpen && (
            <div className="p-2 bg-[#181818] font-mono text-[11px] space-y-1">
              {openTabs.length === 0 ? (
                <div className="p-2 text-slate-500 italic text-xs font-sans">
                  No active open files in workspace.
                </div>
              ) : (
                openTabs.map((tab: { id: string; name: string; path: string; content?: string }) => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between text-amber-400 px-2 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate text-slate-200 font-medium">{tab.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 shrink-0 ml-2">MODIFIED</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
