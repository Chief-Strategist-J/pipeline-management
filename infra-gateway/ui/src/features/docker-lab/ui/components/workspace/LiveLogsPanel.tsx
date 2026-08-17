"use client";

import React from "react";
import { Search, Pause } from "lucide-react";
import type { LogLine } from "@/features/docker-lab/domain/entities/docker-image.entity";

interface LiveLogsPanelProps {
  filteredLogs: LogLine[];
  logFilter: string;
  isAutoRefreshLogs: boolean;
  autoScrollLogs: boolean;
  logsEndRef: React.RefObject<HTMLDivElement | null>;
  onLogFilterChange: (val: string) => void;
  onToggleAutoRefresh: () => void;
  onToggleAutoScroll: (val: boolean) => void;
}

export const LiveLogsPanel: React.FC<LiveLogsPanelProps> = ({
  filteredLogs,
  logFilter,
  isAutoRefreshLogs,
  autoScrollLogs,
  logsEndRef,
  onLogFilterChange,
  onToggleAutoRefresh,
  onToggleAutoScroll,
}) => {
  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={logFilter}
            onChange={(e) => onLogFilterChange(e.target.value)}
            placeholder="Filter log messages..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
            isAutoRefreshLogs
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
          }`}
          title="Toggle 2-Second Live Log Auto-Refresh"
        >
          {isAutoRefreshLogs ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE (2s)</span>
            </>
          ) : (
            <>
              <Pause className="h-3 w-3 text-slate-400" />
              <span>Paused</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 bg-slate-900/90 rounded-xl border border-white/5 p-3 overflow-y-auto font-mono text-[11px] space-y-1">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2 text-slate-300 hover:bg-white/5 py-0.5 px-1 rounded break-all">
              <span className="text-slate-600 select-none shrink-0 text-[10px]">[{log.timestamp.substring(0, 19)}]</span>
              <span className={log.stream === "stderr" ? "text-rose-400 font-semibold" : "text-emerald-300"}>
                {log.message}
              </span>
            </div>
          ))
        ) : (
          <div className="text-slate-600 py-12 text-center">No matching logs</div>
        )}
        <div ref={logsEndRef} />
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
        <span>{filteredLogs.length} total log entries</span>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={autoScrollLogs}
            onChange={(e) => onToggleAutoScroll(e.target.checked)}
            className="rounded border-slate-700 text-blue-500 focus:ring-0"
          />
          <span>Auto-scroll to bottom</span>
        </label>
      </div>
    </div>
  );
};
