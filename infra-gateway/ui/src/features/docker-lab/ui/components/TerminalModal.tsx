"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/Button";
import { Terminal as TerminalIcon, X, CornerDownLeft, Trash2 } from "lucide-react";
import { DockerLabRestAdapter } from "../../adapters/rest/docker-lab-rest.adapter";

function parseCommandPrompt(containerName: string): string {
  return `root@${containerName.substring(0, 16)}:/app#`;
}

interface TerminalModalProps {
  isOpen: boolean;
  containerId: string;
  containerName: string;
  onClose: () => void;
}

const adapter = new DockerLabRestAdapter();

export const TerminalModal: React.FC<TerminalModalProps> = ({
  isOpen,
  containerId,
  containerName,
  onClose,
}) => {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<{ prompt: string; cmd: string; output: string; isError: boolean }[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (history.length === 0) {
        setHistory([{
          prompt: parseCommandPrompt(containerName),
          cmd: "",
          output: `Connected to container terminal: ${containerName} (${containerId.substring(0, 12)})\nType commands to execute inside the live Docker container.\nType 'clear' to reset terminal output.\n`,
          isError: false,
        }]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isExecuting) return;

    const currentCmd = command.trim();
    const promptStr = parseCommandPrompt(containerName);
    setCommand("");
    setCommandHistory((prev) => [...prev, currentCmd]);
    setHistoryIndex(-1);
    setIsExecuting(true);

    if (currentCmd === "clear") {
      setHistory([]);
      setIsExecuting(false);
      return;
    }

    try {
      const res = await adapter.execCommand(containerId, currentCmd);
      setHistory((prev) => [...prev, {
        prompt: promptStr,
        cmd: currentCmd,
        output: res.output || "(no output)",
        isError: res.exitCode !== 0,
      }]);
    } catch (err: any) {
      setHistory((prev) => [...prev, {
        prompt: promptStr,
        cmd: currentCmd,
        output: `Error: ${err.message || "Failed to execute command"}`,
        isError: true,
      }]);
    }

    setIsExecuting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && commandHistory.length > 0) {
      e.preventDefault();
      const newIdx = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIdx);
      setCommand(commandHistory[commandHistory.length - 1 - newIdx]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setCommand(commandHistory[commandHistory.length - 1 - newIdx]);
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[75vh] flex flex-col bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/90 text-xs">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <TerminalIcon className="h-4 w-4" />
            <span>Live Container Shell — {containerName} ({containerId.substring(0, 12)})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistory([])}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear terminal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {history.map((item, i) => (
            <div key={i} className="space-y-1">
              {item.cmd && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400 font-bold">{item.prompt}</span>
                  <span className="text-white font-bold">{item.cmd}</span>
                </div>
              )}
              <pre className={`whitespace-pre-wrap font-mono text-[11px] p-2.5 rounded-lg border ${
                item.isError
                  ? "text-rose-400 bg-rose-950/30 border-rose-500/20"
                  : "text-slate-400 bg-slate-900/60 border-white/5"
              }`}>
                {item.output}
              </pre>
            </div>
          ))}

          {isExecuting && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="animate-pulse">●</span> Executing command...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleRunCommand} className="flex items-center gap-2 p-3 bg-slate-900 border-t border-white/10">
          <span className="text-emerald-400 font-bold text-xs pl-2">{parseCommandPrompt(containerName)}</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command... (e.g. ls, ps, psql -U postgres -c 'SELECT NOW();')"
            className="flex-1 bg-transparent border-none text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none"
            autoFocus
            disabled={isExecuting}
          />
          <Button type="submit" size="sm" variant="primary" isLoading={isExecuting} disabled={isExecuting}>
            <CornerDownLeft className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
