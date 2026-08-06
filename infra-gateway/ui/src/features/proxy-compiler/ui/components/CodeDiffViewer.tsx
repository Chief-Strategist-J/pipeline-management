"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode } from "lucide-react";

interface FileItem {
  filename: string;
  path: string;
  content: string;
  proxyType: string;
}

interface CodeDiffViewerProps {
  files: FileItem[];
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ files }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!files || files.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 italic">
        No compiled configuration output available. Trigger compilation above.
      </div>
    );
  }

  const currentFile = files[selectedIdx] || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* File Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {files.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedIdx === idx
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Code Editor Preview */}
      <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800/80 overflow-x-auto min-h-[300px]">
        <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-3">
          Path: {currentFile.path}
        </div>
        <pre className="text-slate-200 leading-relaxed whitespace-pre-wrap">{currentFile.content}</pre>
      </div>
    </div>
  );
};
