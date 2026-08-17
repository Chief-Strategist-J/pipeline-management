"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Activity,
  HelpCircle,
  FileText,
  Settings,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio,
  Code,
  Sparkles,
  Download,
  Pause,
  Zap,
  HardDriveDownload,
  AlertTriangle,
  X,
  FileArchive,
  Database,
} from "lucide-react";
import { useContainerWorkspace, type BackupSelection } from "../hooks/useContainerWorkspace";

interface ContainerWorkspaceProps {
  containerId: string;
  containerName: string;
  imageId?: string;
  imageName?: string;
  onBackToLab?: () => void;
}

export const ContainerWorkspace: React.FC<ContainerWorkspaceProps> = ({
  containerId,
  containerName,
  imageId = "default",
  onBackToLab,
}) => {
  const w = useContainerWorkspace(containerId, containerName, imageId, onBackToLab);

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 px-1 gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={w.handleExitClick}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Lab
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-base shadow-lg shadow-emerald-500/10">
                ⚡
              </div>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-white tracking-tight">{containerName}</h2>
                <Badge variant="success">ID: {containerId.substring(0, 12)}</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Catalog Image: <span className="text-blue-400 font-bold">{imageId}</span> &bull; 3-Phase Rules Engine Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={w.fetchLogs} isLoading={w.isFetchingLogs}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Logs
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={w.runTestProbe} isLoading={w.isTestingProbe}>
            <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Health Probe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden">
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
                  onClick={() => w.setFontSize("xs")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${w.fontSize === "xs" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Small Font"
                >
                  Aa-
                </button>
                <button
                  type="button"
                  onClick={() => w.setFontSize("sm")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${w.fontSize === "sm" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Medium Font"
                >
                  Aa
                </button>
                <button
                  type="button"
                  onClick={() => w.setFontSize("base")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${w.fontSize === "base" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Large Font"
                >
                  Aa+
                </button>
              </div>

              {w.history.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={w.downloadTerminalLogs}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md flex items-center gap-1"
                    title="Export Terminal Session Logs"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-[10px] font-bold">Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => w.setHistory([])}
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

          <div className={`flex-1 p-4 overflow-y-auto font-mono ${w.fontSize === "xs" ? "text-xs" : w.fontSize === "sm" ? "text-sm" : "text-base"} space-y-3 bg-slate-950/90`}>
            {w.history.length === 0 && (
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-2">
                <p className="text-emerald-400 font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> 3-Phase Rules Engine Terminal Ready
                </p>
                <p className="text-slate-400 text-[11px]">
                  Type shell or service queries below. Click any quick command chip below to populate the prompt instantly.
                </p>
              </div>
            )}

            {w.history.map((item, idx) => (
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
                      onClick={() => w.copyToClipboard(item.output, idx)}
                      className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                      title="Copy Output"
                    >
                      {w.copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    item.exitCode === 0
                      ? "bg-slate-900/90 border-emerald-500/20 text-slate-200"
                      : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                  } whitespace-pre-wrap font-mono ${w.fontSize === "xs" ? "text-[11px]" : w.fontSize === "sm" ? "text-xs" : "text-sm"} leading-relaxed break-all`}
                >
                  {item.output}
                </div>
              </div>
            ))}

            {w.isExecuting && (
              <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>Executing command via Rules Engine...</span>
              </div>
            )}

            <div ref={w.terminalEndRef} />
          </div>

          {w.helpCommands.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/90 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Quick Chips:
              </span>
              {w.helpCommands.slice(0, 5).map((hc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => w.setCommand(hc.command)}
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
              value={w.command}
              onChange={(e) => w.setCommand(e.target.value)}
              onKeyDown={w.handleKeyDown}
              placeholder="Type command (e.g. kafka-topics.sh --list or SELECT 1; or PING)..."
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              disabled={w.isExecuting}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => w.handleExecuteCommand()}
              isLoading={w.isExecuting}
              disabled={!w.command.trim()}
            >
              <Play className="h-3.5 w-3.5 mr-1" /> Run
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center border-b border-white/10 bg-slate-900">
            <button
              type="button"
              onClick={() => w.setActiveTab("logs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "logs"
                  ? "border-blue-500 text-blue-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Live Logs
            </button>
            <button
              type="button"
              onClick={() => w.setActiveTab("help")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "help"
                  ? "border-emerald-500 text-emerald-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" /> CLI Help ({w.helpCommands.length})
            </button>
            <button
              type="button"
              onClick={() => w.setActiveTab("specs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "specs"
                  ? "border-purple-500 text-purple-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Container Specs
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80">
            {w.activeTab === "logs" && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={w.logFilter}
                      onChange={(e) => w.setLogFilter(e.target.value)}
                      placeholder="Filter log messages..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => w.setIsAutoRefreshLogs(!w.isAutoRefreshLogs)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                      w.isAutoRefreshLogs
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
                    }`}
                    title="Toggle 2-Second Live Log Auto-Refresh"
                  >
                    {w.isAutoRefreshLogs ? (
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
                  {w.filteredLogs.length > 0 ? (
                    w.filteredLogs.map((log, idx) => (
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
                  <div ref={w.logsEndRef} />
                </div>

                <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                  <span>{w.filteredLogs.length} total log entries</span>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={w.autoScrollLogs}
                      onChange={(e) => w.setAutoScrollLogs(e.target.checked)}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                    <span>Auto-scroll to bottom</span>
                  </label>
                </div>
              </div>
            )}

            {w.activeTab === "help" && (
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
                  {w.helpCommands.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => w.setCommand(item.command)}
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
                              w.handleExecuteCommand(item.command);
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
            )}

            {w.activeTab === "specs" && (() => {
              const configJson = JSON.stringify(w.catalogItem?.defaultConfig || {}, null, 2);

              return (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2.5 font-mono text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Instance Runtime</span>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Container ID:</span>
                      <span className="text-white font-bold">{containerId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        {w.containerInfo.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Image Repository:</span>
                      <span className="text-blue-400 font-bold">{w.catalogItem?.image || imageId}:{w.catalogItem?.defaultTag || "latest"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Port Bindings:</span>
                      <span className="text-indigo-300 font-bold">{w.containerInfo.ports.join(", ") || "None"}</span>
                    </div>
                  </div>

                  {w.catalogItem?.defaultConfig?.envVars && w.catalogItem.defaultConfig.envVars.length > 0 && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Environment Variables ({w.filteredEnvVars.length})
                        </span>
                        <input
                          type="text"
                          value={w.envFilter}
                          onChange={(e) => w.setEnvFilter(e.target.value)}
                          placeholder="Search env..."
                          className="px-2 py-0.5 bg-slate-950 border border-white/10 rounded text-[10px] text-white focus:outline-none focus:border-blue-500 w-28"
                        />
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {w.filteredEnvVars.map((env, i) => (
                          <div key={i} className="flex flex-col gap-0.5 p-2 bg-slate-950 rounded-lg border border-white/5 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{env.key}</span>
                            <span className="text-slate-300 break-all text-[10px] leading-relaxed">{env.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {w.testResult && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          {w.testResult.healthy ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-400" />
                          )}
                          Health Probe: {w.testResult.healthy ? "HEALTHY" : "UNHEALTHY"}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{w.testResult.latencyMs} ms</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-white/5 break-all">
                        {w.testResult.message}
                      </p>
                    </div>
                  )}

                  <Button type="button" variant="secondary" size="sm" onClick={w.runTestProbe} isLoading={w.isTestingProbe} className="w-full">
                    <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Re-run Health Probe
                  </Button>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configuration JSON</span>
                      <button
                        type="button"
                        onClick={() => w.copyToClipboard(configJson, 999)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-white/5"
                      >
                        {w.copiedIdx === 999 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span className="text-[11px]">Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-52 leading-relaxed">
                      {configJson}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {w.showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Leave Container Workspace?</h3>
              </div>
              <button type="button" onClick={() => w.setShowExitModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit workspace for container <span className="font-bold text-white font-mono">{containerName}</span>?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={w.handleKeepRunningAndExit}
                className="w-full p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Keep Container Running & Return
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
              </button>

              <button
                type="button"
                onClick={w.handleProceedToStopCleanup}
                className="w-full p-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" /> Stop & Cleanup Container
                </span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">Teardown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {w.showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-400">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <HardDriveDownload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Select Backup & Teardown Option</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Target Container: {containerName} ({imageId})
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => w.setShowBackupModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label
                onClick={() => w.setSelectedBackupOption("volume")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  w.selectedBackupOption === "volume"
                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={w.selectedBackupOption === "volume"}
                  onChange={() => w.setSelectedBackupOption("volume")}
                  className="mt-1 text-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <FileArchive className="h-4 w-4 text-amber-400" />
                    <span>Option 1: Complete Volume Storage Archive (.json / .tar.gz)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exports physical storage mount destinations, active logs, environment variables, and Docker inspect specifications.
                  </p>
                </div>
              </label>

              {w.backupRule.hasNativeBackup && (
                <label
                  onClick={() => w.setSelectedBackupOption("native")}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    w.selectedBackupOption === "native"
                      ? "bg-blue-600/20 border-blue-500/50 text-white"
                      : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="backupOption"
                    checked={w.selectedBackupOption === "native"}
                    onChange={() => w.setSelectedBackupOption("native")}
                    className="mt-1 text-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>Option 2: Native Database Dump (.{w.backupRule.fileExtension})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Executes native CLI exporter <code className="text-emerald-300 font-mono">{w.backupRule.backupCommand}</code> directly inside container.
                    </p>
                  </div>
                </label>
              )}

              <label
                onClick={() => w.setSelectedBackupOption("snapshot")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  w.selectedBackupOption === "snapshot"
                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={w.selectedBackupOption === "snapshot"}
                  onChange={() => w.setSelectedBackupOption("snapshot")}
                  className="mt-1 text-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span>Option 3: Container Snapshot State (.json)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exports inspect metadata, active logs, environment variables, and network status.
                  </p>
                </div>
              </label>

              <label
                onClick={() => w.setSelectedBackupOption("none")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  w.selectedBackupOption === "none"
                    ? "bg-rose-600/20 border-rose-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={w.selectedBackupOption === "none"}
                  onChange={() => w.setSelectedBackupOption("none")}
                  className="mt-1 text-rose-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Trash2 className="h-4 w-4 text-rose-400" />
                    <span>Option 4: Purge Container Without Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Deletes container immediately from local Docker daemon without generating backup.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant={w.selectedBackupOption === "none" ? "danger" : "primary"}
                size="sm"
                onClick={w.handleConfirmTeardown}
                isLoading={w.isDeleting}
                className="flex-1 py-2.5"
              >
                <HardDriveDownload className="h-4 w-4 mr-2" /> Confirm & Execute Teardown
              </Button>

              <button
                type="button"
                onClick={() => w.setShowBackupModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
