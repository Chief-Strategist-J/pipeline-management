import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, GitBranch, Loader2, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { pushToGitHubAction } from "../../state/file-explorer.slice";
import { selectIsPushingGitHub, selectGithubPushResult, selectTreeData } from "../../readModels/file-explorer.selectors";

export const GitHubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const isPushing = useSelector(selectIsPushingGitHub);
  const pushResult = useSelector(selectGithubPushResult);
  const activeTreeData = useSelector(selectTreeData);

  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [commitMessage, setCommitMessage] = useState("feat: sync selected architecture template tree from OpenVSCode IDE");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loadedFromMongo, setLoadedFromMongo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/github/token")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            setToken(data.token);
            if (data.repoName) setRepoName(data.repoName);
            if (data.branchName) setBranchName(data.branchName);
            setIsPrivate(!!data.isPrivate);
            setLoadedFromMongo(true);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !repoName.trim()) return;

    dispatch(
      pushToGitHubAction({
        token: token.trim(),
        repoName: repoName.trim(),
        branchName: branchName.trim() || "main",
        commitMessage: commitMessage.trim(),
        isPrivate,
        treeData: activeTreeData,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="h-12 bg-[#2d2d2d] px-4 border-b border-[#3c3c3c] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <GitHubIcon className="h-5 w-5 text-purple-400" />
            <span>Push Code & Sync Selected Template to GitHub</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {loadedFromMongo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded text-[11px] font-mono text-emerald-300">
              <Database className="h-3.5 w-3.5" />
              <span>Loaded saved PAT Token from MongoDB database</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>GitHub Personal Access Token (PAT)</span>
              </span>
              <span className="text-[10px] text-purple-400">Stored in MongoDB</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Repository Name
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-awesome-pipeline"
                required
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-blue-400" />
                <span>Branch</span>
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="main"
                required
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-blue-400" />
              <span>Git Commit Message</span>
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#1e1e1e] p-2.5 rounded border border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded bg-[#141414] border-[#3c3c3c] text-purple-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isPrivate" className="select-none cursor-pointer text-slate-200">
                Create Private Repo (if new)
              </label>
            </div>
            <span className="text-purple-400 font-semibold">Pushes active template tree</span>
          </div>

          {pushResult && (
            <div
              className={`p-3 rounded text-xs font-mono border ${
                pushResult.success
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {pushResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                )}
                <span>{pushResult.success ? "GitHub Code Sync Success!" : "Push Failed"}</span>
              </div>
              <p className="whitespace-pre-wrap">{pushResult.message}</p>
              {pushResult.repoUrl && (
                <a
                  href={pushResult.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-purple-400 hover:underline font-bold"
                >
                  <span>Open Remote Repository ({branchName})</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#3c3c3c]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#3c3c3c] hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPushing}
              className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isPushing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Pushing Active Template...</span>
                </>
              ) : (
                <>
                  <GitHubIcon className="h-3.5 w-3.5" />
                  <span>Sync Selected Template Code</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
