"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Activity, Square, Terminal as TerminalIcon, CheckCircle2, AlertCircle, RefreshCw, Radio, ExternalLink, Download, HardDrive } from "lucide-react";
import { TerminalModal } from "./TerminalModal";
import type {
  RunningContainer,
  TestResult,
  LogLine
} from "../../domain/entities/docker-image.entity";

function formatLatencyColor(latencyMs: number): string {
  if (latencyMs < 20) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (latencyMs < 100) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-rose-400 border-rose-500/30 bg-rose-500/10";
}

function extractFirstHostPort(ports: string[]): number | null {
  if (!ports || ports.length === 0) return null;
  const match = ports[0].match(/(?:0\.0\.0\.0:)?(\d+)->/);
  return match ? parseInt(match[1]) : null;
}

interface ExecutionPanelProps {
  runningContainers: RunningContainer[];
  activeContainerId: string | null;
  testResults: Record<string, TestResult>;
  containerLogs: Record<string, LogLine[]>;
  onSelectContainer: (id: string) => void;
  onTestContainer: (id: string) => void;
  onFetchLogs: (id: string) => void;
  onStopContainer: (id: string, backup?: boolean) => void;
  isLoading: boolean;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  runningContainers,
  activeContainerId,
  testResults,
  containerLogs,
  onSelectContainer,
  onTestContainer,
  onFetchLogs,
  onStopContainer,
  isLoading,
}) => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const activeContainer = runningContainers.find((c) => c.containerId === activeContainerId) || runningContainers[0];
  const activeTestResult = activeContainer ? testResults[activeContainer.containerId] : null;
  const activeLogs = activeContainer ? containerLogs[activeContainer.containerId] || [] : [];
  const hostPort = activeContainer ? extractFirstHostPort(activeContainer.ports) : null;

  useEffect(() => {
    if (activeContainer) {
      onFetchLogs(activeContainer.containerId);
    }
  }, [activeContainer?.containerId]);

  if (runningContainers.length === 0) {
    return (
      <GlassCard className="p-8 text-center border-dashed border-white/10 text-slate-500">
        <Activity className="h-10 w-10 mx-auto text-slate-700 mb-2 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-400">No Active Running Execution Instances</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Click "Execute" on any Docker image to run it directly on this system via Docker.
          Real containers will be created, and you can shell into them, run queries, and view live logs.
        </p>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard glow className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Live Docker Execution Runtime</h3>
                <Badge variant="success">{runningContainers.length} Running</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Real Docker containers running on this system. Shell in, run queries, view live logs, and access web dashboards.
              </p>
            </div>
          </div>

          {activeContainer && (
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`/docker-lab/workspace/${activeContainer.containerId}`}
                className="inline-flex items-center justify-center font-bold rounded-xl px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 backdrop-blur-md transition-all shadow-lg shadow-emerald-500/20"
              >
                <TerminalIcon className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Open Command Center Workspace
              </a>
              {hostPort && (
                <a
                  href={`http://localhost:${hostPort}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center font-medium rounded-xl px-3 py-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 backdrop-blur-md transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-indigo-400" /> Open UI (:{hostPort})
                </a>
              )}
              <Button variant="secondary" size="sm" onClick={() => setIsTerminalOpen(true)}>
                <TerminalIcon className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Quick Shell
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onTestContainer(activeContainer.containerId)} isLoading={isLoading}>
                <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Test Probe
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onFetchLogs(activeContainer.containerId)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Logs
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowStopConfirm(true)} isLoading={isLoading}>
                <Square className="h-3.5 w-3.5 mr-1.5" /> Stop
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {runningContainers.map((c) => {
            const isSelected = activeContainer?.containerId === c.containerId;
            return (
              <button
                key={c.containerId}
                onClick={() => onSelectContainer(c.containerId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all border ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/20"
                    : "bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{c.containerName}</span>
              </button>
            );
          })}
        </div>

        {activeContainer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Instance Details</span>
                <div className="text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Container ID:</span>
                    <span className="text-slate-200 font-bold">{activeContainer.containerId.substring(0, 12)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Replica:</span>
                    <span className="text-blue-400">#{activeContainer.replicaIndex}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">{activeContainer.status}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ports:</span>
                    <span className="text-indigo-300">{activeContainer.ports.join(", ") || "None"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-400" /> Health Probe
                  </span>
                  {activeTestResult && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${formatLatencyColor(activeTestResult.latencyMs)}`}>
                      {activeTestResult.latencyMs} ms
                    </span>
                  )}
                </div>

                {activeTestResult ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      {(activeTestResult.healthy ?? activeTestResult.success) ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <span className="font-bold text-white">
                        {(activeTestResult.healthy ?? activeTestResult.success) ? "HEALTHY" : "UNHEALTHY"}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-white/5 mt-1 break-all">
                      {activeTestResult.probeOutput || activeTestResult.message}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-2 text-center">
                    Click "Test Probe" to verify container health.
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col h-64 bg-slate-950 rounded-xl border border-white/10 overflow-hidden font-mono">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/10 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <TerminalIcon className="h-3.5 w-3.5 text-blue-400" /> Live Docker Logs ({activeContainer.containerId.substring(0, 8)})
                </span>
                <button onClick={() => onFetchLogs(activeContainer.containerId)} className="hover:text-white transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px]">
                {activeLogs.length > 0 ? (
                  activeLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-slate-300 hover:bg-white/5 py-0.5 px-1 rounded">
                      <span className="text-slate-600 select-none shrink-0">[{log.timestamp.substring(0, 19)}]</span>
                      <span className={log.stream === "stderr" ? "text-rose-400" : "text-emerald-300"}>{log.message || log.line}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 py-8 text-center">Waiting for logs...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {activeContainer && (
        <TerminalModal
          isOpen={isTerminalOpen}
          containerId={activeContainer.containerId}
          containerName={activeContainer.containerName}
          onClose={() => setIsTerminalOpen(false)}
        />
      )}

      {showStopConfirm && activeContainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard glow className="max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Square className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Stop Container: {activeContainer.containerName}</h3>
                <p className="text-xs text-slate-400">This will stop and remove the Docker container.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/20 text-xs text-amber-300">
              <div className="flex items-center gap-2 mb-1 font-bold">
                <HardDrive className="h-4 w-4" /> Data Backup Option
              </div>
              <p className="text-[11px] text-slate-400">
                If this container has persistent data (databases, volumes), you can backup its data before stopping.
                The backup will be saved to <span className="font-mono text-slate-300">/tmp/docker-lab-backup-*</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowStopConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onStopContainer(activeContainer.containerId, false);
                  setShowStopConfirm(false);
                }}
                className="flex-1"
              >
                <Square className="h-3.5 w-3.5 mr-1.5" /> Stop (No Backup)
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onStopContainer(activeContainer.containerId, true);
                  setShowStopConfirm(false);
                }}
                className="flex-1"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Backup & Stop
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
};
