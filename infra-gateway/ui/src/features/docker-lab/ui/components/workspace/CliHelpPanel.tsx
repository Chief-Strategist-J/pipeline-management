"use client";

import React from "react";
import { Badge } from "@/shared/ui/Badge";
import { Code } from "lucide-react";
import type { HelpCommand } from "@/features/docker-lab/constants/docker-help.constants";

interface CliHelpPanelProps {
  helpCommands: HelpCommand[];
  onSelectCommand: (cmd: string) => void;
  onExecuteCommand: (cmd: string) => void;
}

export const CliHelpPanel: React.FC<CliHelpPanelProps> = ({
  helpCommands,
  onSelectCommand,
  onExecuteCommand,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
        <p className="font-bold flex items-center gap-1.5">
          <Code className="h-4 w-4" /> Quick Command Reference
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Click any card to populate into the prompt, or click "Run Now" for immediate execution.
        </p>
      </div>

      <div className="space-y-2.5">
        {helpCommands.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectCommand(item.command)}
            className="w-full text-left p-3 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{item.category}</Badge>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecuteCommand(item.command);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold bg-blue-600/30 hover:bg-blue-600/60 text-blue-200 border border-blue-500/30 rounded-lg transition-all"
                >
                  Run Now
                </button>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-300 mt-2 bg-slate-950 p-2 rounded-lg border border-white/5 break-all">
              {item.command}
            </p>
            <p className="text-[10px] text-slate-500 mt-1.5">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
