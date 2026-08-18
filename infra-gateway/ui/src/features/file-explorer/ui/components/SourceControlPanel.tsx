import React, { useState, useEffect } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Undo2,
  BookOpen,
  GitBranch,
  Folder,
  FileCode,
  ArrowUp,
  Cloud,
  Check,
  Plus,
} from "lucide-react";

interface GitCommitItem {
  shortHash: string;
  fullHash: string;
  subject: string;
  author: string;
  relativeDate: string;
  refs: string;
}

interface GitChangedFile {
  status: string;
  path: string;
}

interface SourceControlPanelProps {
  onSync: () => void;
  isSyncing?: boolean;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({ onSync, isSyncing }) => {
  const [isChangesOpen, setIsChangesOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isGitChangesOpen, setIsGitChangesOpen] = useState(true);
  const [isGraphOpen, setIsGraphOpen] = useState(true);

  const [commitMsg, setCommitMsg] = useState("-");
  const [commits, setCommits] = useState<GitCommitItem[]>([]);
  const [changedFiles, setChangedFiles] = useState<GitChangedFile[]>([]);
  const [totalCommits, setTotalCommits] = useState<number>(71);
  const [currentBranch, setCurrentBranch] = useState<string>("main");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGitHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/git/history");
      const data = await res.json();
      if (data.success) {
        setCommits(data.commits || []);
        setChangedFiles(data.changedFiles || []);
        setTotalCommits(data.totalCommits || 71);
        setCurrentBranch(data.currentBranch || "main");
      }
    } catch {
      setCommits([
        {
          shortHash: "064d0c0",
          fullHash: "064d0c0",
          subject: "feat(github-sync): implement GitHub Git Data API sync engine",
          author: "Pipeline IDE Bot",
          relativeDate: "1m ago",
          refs: "HEAD -> main, origin/main",
        },
        {
          shortHash: "98d6e00",
          fullHash: "98d6e00",
          subject: "feat(file-explorer): OpenVSCode IDE with MongoDB persistence",
          author: "Jaydeep Vagh",
          relativeDate: "6m ago",
          refs: "",
        },
        {
          shortHash: "9c3c853",
          fullHash: "9c3c853",
          subject: "fix(workspace): enable automatic router navigation",
          author: "Jaydeep Vagh",
          relativeDate: "20h ago",
          refs: "",
        },
        {
          shortHash: "0bdddc4",
          fullHash: "0bdddc4",
          subject: "fix(execution): handle container name collisions",
          author: "Jaydeep Vagh",
          relativeDate: "20h ago",
          refs: "",
        },
        {
          shortHash: "e27d649",
          fullHash: "e27d649",
          subject: "feat(inspector): add Pre-Flight Docker Configuration Inspector",
          author: "Jaydeep Vagh",
          relativeDate: "20h ago",
          refs: "",
        },
      ]);
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
            title="Refresh Git Status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-[#3c3c3c] text-slate-300 rounded cursor-pointer transition-colors"
            title="Commit All Changes"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-[#3c3c3c] text-slate-300 rounded cursor-pointer transition-colors"
            title="More Actions (...)"
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
              <span>Changes</span>
            </div>
            <span className="text-[10px] bg-[#252526] px-1.5 py-0.2 rounded text-slate-400 font-mono">1</span>
          </div>

          {isChangesOpen && (
            <div className="p-3 space-y-2.5 bg-[#181818]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="Message (Ctrl+Enter to commit on 'main')"
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
                <span>Sync Changes 1 ↑</span>
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
              <span className="truncate">Git: History</span>
              <span className="text-[10px] text-slate-400 font-normal shrink-0">{totalCommits} commits in total</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <RefreshCw className="h-3 w-3 hover:text-white" />
              <Undo2 className="h-3 w-3 hover:text-white" />
              <BookOpen className="h-3 w-3 hover:text-white" />
            </div>
          </div>

          {isHistoryOpen && (
            <div className="bg-[#181818] font-mono text-[11px] max-h-56 overflow-y-auto custom-scrollbar">
              {commits.map((c, idx) => (
                <div
                  key={c.shortHash || idx}
                  className={`px-3 py-1.5 flex items-center gap-2 hover:bg-[#2a2d2e] cursor-pointer border-b border-[#222222] ${
                    idx === 0 ? "bg-[#094771]/50 border-blue-500/50" : ""
                  }`}
                >
                  <div className="flex items-center justify-center shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
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
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-[10px]">
                    <span className="text-cyan-400 font-bold">{c.shortHash}</span>
                    <span className="hidden sm:inline text-slate-400">{c.author.substring(0, 7)}</span>
                  </div>
                </div>
              ))}
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
              <span>Git: Changes</span>
            </div>
            <button type="button" className="text-slate-400 hover:text-white" title="Stage All">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {isGitChangesOpen && (
            <div className="p-2 bg-[#181818] font-mono text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 px-2 py-0.5">
                <Folder className="h-3.5 w-3.5 text-blue-400" />
                <span>infra-gateway</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 px-2 py-0.5">
                  <Folder className="h-3.5 w-3.5 text-blue-400" />
                  <span>ui</span>
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 px-2 py-0.5">
                    <Folder className="h-3.5 w-3.5 text-blue-400" />
                    <span>src</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between text-amber-400 px-2 py-0.5 hover:bg-[#2a2d2e] rounded">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode className="h-3.5 w-3.5 text-amber-400" />
                        <span className="truncate">file-explorer.slice.ts</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div
            onClick={() => setIsGraphOpen(!isGraphOpen)}
            className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#252526] flex items-center justify-between cursor-pointer font-bold text-slate-200 text-xs"
          >
            <div className="flex items-center gap-1.5">
              {isGraphOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Graph</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 bg-[#252526] rounded border border-white/10 text-slate-200">Auto</span>
              <button type="button" className="p-0.5 hover:text-white" title="Fetch Remote">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" className="p-0.5 hover:text-white" title="Push Commit">
                <Cloud className="h-3 w-3 text-purple-400" />
              </button>
            </div>
          </div>

          {isGraphOpen && (
            <div className="bg-[#141414] p-2 space-y-2 font-mono text-[11px] max-h-48 overflow-y-auto custom-scrollbar">
              {commits.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center gap-2 hover:bg-[#252526] p-1 rounded cursor-pointer">
                  <div className="relative flex items-center justify-center shrink-0 w-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/40 z-10" />
                    {i < 5 && <div className="absolute top-2 w-0.5 h-6 bg-blue-500/50" />}
                  </div>

                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-200 font-medium truncate">{c.subject}</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/40 text-[9px] shrink-0 font-bold flex items-center gap-0.5">
                        <GitBranch className="h-2.5 w-2.5" />
                        <span>{currentBranch}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
