"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Check,
  Radio,
  Sparkles,
  Download,
  Zap,
} from "lucide-react";
import type { HelpCommand } from "@/features/docker-lab/constants/docker-help.constants";

interface TerminalItem {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: string;
}

interface TerminalShellProps {
  history: TerminalItem[];
  command: string;
  isExecuting: boolean;
  fontSize: "xs" | "sm" | "base";
  copiedIdx: number | null;
  helpCommands: HelpCommand[];
  terminalEndRef: React.RefObject<HTMLDivElement | null>;
  onCommandChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onExecuteCommand: (cmd?: string) => void;
  onCopyOutput: (text: string, idx: number) => void;
  onExportLogs: () => void;
  onClearHistory: () => void;
  onChangeFontSize: (size: "xs" | "sm" | "base") => void;
}

export const TerminalShell: React.FC<TerminalShellProps> = ({
  history,
  command,
  isExecuting,
  fontSize,
  copiedIdx,
  helpCommands,
  terminalEndRef,
  onCommandChange,
  onKeyDown,
  onExecuteCommand,
  onCopyOutput,
  onExportLogs,
  onClearHistory,
  onChangeFontSize,
}) => {
  return (
    <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-white/10" />
          <TerminalIcon className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Interactive Container Terminal Shell</span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-white/5">
            Rules Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => onChangeFontSize("xs")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "xs" ? "bg-white/10 text-white" : "text-slate-500"}`}
              title="Small Font"
            >
              Aa-
            </button>
            <button
              type="button"
              onClick={() => onChangeFontSize("sm")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "sm" ? "bg-white/10 text-white" : "text-slate-500"}`}
              title="Medium Font"
            >
              Aa
            </button>
            <button
              type="button"
              onClick={() => onChangeFontSize("base")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "base" ? "bg-white/10 text-white" : "text-slate-500"}`}
              title="Large Font"
            >
              Aa+
            </button>
          </div>

          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={onExportLogs}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md flex items-center gap-1"
                title="Export Terminal Session Logs"
              >
                <Download className="h-3 w-3" />
                <span className="text-[10px] font-bold">Export</span>
              </button>

              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md flex items-center gap-1"
                title="Clear Terminal Output"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-[10px] font-bold">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`flex-1 p-4 overflow-y-auto font-mono ${fontSize === "xs" ? "text-xs" : fontSize === "sm" ? "text-sm" : "text-base"} space-y-3 bg-slate-950/90`}>
        {history.length === 0 && (
          <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-2">
            <p className="text-emerald-400 font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 3-Phase Rules Engine Terminal Ready
            </p>
            <p className="text-slate-400 text-[11px]">
              Type shell or service queries below. Click any quick command chip below to populate the prompt instantly.
            </p>
          </div>
        )}

        {history.map((item, idx) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-blue-400">
                <span>$</span>
                <span>{item.command}</span>
              </span>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{item.timestamp}</span>
                <button
                  type="button"
                  onClick={() => onCopyOutput(item.output, idx)}
                  className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                  title="Copy Output"
                >
                  {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                item.exitCode === 0
                  ? "bg-slate-900/90 border-emerald-500/20 text-slate-200"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-300"
              } whitespace-pre-wrap font-mono ${fontSize === "xs" ? "text-[11px]" : fontSize === "sm" ? "text-xs" : "text-sm"} leading-relaxed break-all`}
            >
              {item.output}
            </div>
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>Executing command via Rules Engine...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {helpCommands.length > 0 && (
        <div className="px-3 py-2 bg-slate-950/90 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Quick Chips:
          </span>
          {helpCommands.slice(0, 5).map((hc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onCommandChange(hc.command)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-emerald-300 rounded-lg border border-white/5 hover:border-emerald-500/30 shrink-0 transition-all"
              title={hc.description}
            >
              {hc.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2.5">
        <span className="text-emerald-400 font-mono font-bold text-sm">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => onCommandChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type command (e.g. kafka-topics.sh --list or SELECT 1; or PING)..."
          className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
          disabled={isExecuting}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onExecuteCommand()}
          isLoading={isExecuting}
          disabled={!command.trim()}
        >
          <Play className="h-3.5 w-3.5 mr-1" /> Run
        </Button>
      </div>
    </div>
  );
};
