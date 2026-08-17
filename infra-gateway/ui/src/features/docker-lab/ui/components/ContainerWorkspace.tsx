"use client";

import React, { useState, useEffect, useRef } from "react";
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
  LogOut,
  ShieldAlert,
  HardDriveDownload,
  AlertTriangle,
  X,
} from "lucide-react";
import { DOCKER_HELP_COMMANDS, DEFAULT_HELP_COMMANDS } from "../../constants/docker-help.constants";
import { DOCKER_IMAGES_CATALOG } from "../../domain/docker-images.catalog";
import { resolveBackupRule } from "../../rules/docker-backup.rules";


interface ContainerWorkspaceProps {
  containerId: string;
  containerName: string;
  imageId?: string;
  imageName?: string;
  onBackToLab?: () => void;
}

interface LogLine {
  timestamp: string;
  stream: "stdout" | "stderr";
  message: string;
}

interface TestResult {
  healthy: boolean;
  message: string;
  latencyMs: number;
}

export const ContainerWorkspace: React.FC<ContainerWorkspaceProps> = ({
  containerId,
  containerName,
  imageId = "default",
  onBackToLab,
}) => {
  const [activeTab, setActiveTab] = useState<"logs" | "help" | "specs">("logs");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<{ id: string; command: string; output: string; exitCode: number; timestamp: string }[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<"xs" | "sm" | "base">("xs");

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logFilter, setLogFilter] = useState("");
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [isAutoRefreshLogs, setIsAutoRefreshLogs] = useState(true);
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);

  const [envFilter, setEnvFilter] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingProbe, setIsTestingProbe] = useState(false);
  const [containerInfo, setContainerInfo] = useState<{ ports: string[]; env: Record<string, string>; status: string }>({
    ports: [],
    env: {},
    status: "running",
  });

  const [showExitModal, setShowExitModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const helpCommands = DOCKER_HELP_COMMANDS[imageId] || DEFAULT_HELP_COMMANDS;
  const catalogItem = DOCKER_IMAGES_CATALOG.find((img) => img.id === imageId);

  useEffect(() => {
    fetchContainerDetails();
    fetchLogs();
  }, [containerId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoRefreshLogs) {
      timer = setInterval(() => {
        fetchLogsSilently();
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [containerId, isAutoRefreshLogs]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isExecuting]);

  useEffect(() => {
    if (autoScrollLogs) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScrollLogs]);

  const fetchContainerDetails = async () => {
    try {
      const res = await fetch(`/api/docker-lab/containers`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.containers || [];
        const found = list.find((c: any) =>
          c.containerId === containerId ||
          c.containerName === containerName ||
          c.containerId?.startsWith(containerId)
        );
        if (found) {
          setContainerInfo({
            ports: found.ports || [],
            env: found.env || {},
            status: found.status || "running",
          });
        }
      }
    } catch {
      // Fallback intact
    }
  };

  const fetchLogsSilently = async () => {
    try {
      const res = await fetch(`/api/docker-lab/logs?containerId=${containerId}&tail=300`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.logs || []);
      }
    } catch {
      // Keep state clean
    }
  };

  const fetchLogs = async () => {
    setIsFetchingLogs(true);
    await fetchLogsSilently();
    setIsFetchingLogs(false);
  };

  const runTestProbe = async () => {
    setIsTestingProbe(true);
    try {
      const res = await fetch(`/api/docker-lab/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          healthy: data.success,
          message: data.message,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setTestResult({
        healthy: false,
        message: err.message || "Test probe failed",
        latencyMs: 0,
      });
    } finally {
      setIsTestingProbe(false);
    }
  };

  const handleExecuteCommand = async (cmdToRun?: string) => {
    const targetCmd = (cmdToRun || command).trim();
    if (!targetCmd || isExecuting) return;

    setIsExecuting(true);
    if (!cmdToRun) setCommand("");

    setCommandHistory((prev) => [targetCmd, ...prev.filter((c) => c !== targetCmd)]);
    setHistoryIdx(-1);

    const timestamp = new Date().toLocaleTimeString();

    try {
      const res = await fetch("/api/docker-lab/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerId, command: targetCmd }),
      });

      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          command: targetCmd,
          output: data.output || data.error || "(No output returned)",
          exitCode: data.exitCode ?? (data.error ? 1 : 0),
          timestamp,
        },
      ]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          command: targetCmd,
          output: `Execution Failed: ${err.message}`,
          exitCode: 1,
          timestamp,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleExecuteCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, commandHistory.length - 1);
        setHistoryIdx(nextIdx);
        setCommand(commandHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setCommand(commandHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setCommand("");
      }
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const downloadTerminalLogs = () => {
    const text = history.map((h) => `[$ ${h.command} - ${h.timestamp}]\n${h.output}\n`).join("\n---\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terminal-session-${containerId.substring(0, 8)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleKeepRunningAndExit = () => {
    setShowExitModal(false);
    if (onBackToLab) onBackToLab();
  };

  const handleProceedToStopCleanup = () => {
    setShowExitModal(false);
    setShowBackupModal(true);
  };

  const handleConfirmDeleteContainer = async (withBackup: boolean) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/docker-lab/containers?containerId=${containerId}&backup=${withBackup}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        if (withBackup && data.backupContent && data.backupFilename) {
          const blob = new Blob([data.backupContent], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.backupFilename;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch {
      // Intact
    } finally {
      setIsDeleting(false);
      setShowBackupModal(false);
      if (onBackToLab) onBackToLab();
    }
  };

  const filteredLogs = logs.filter((l) =>
    logFilter ? l.message.toLowerCase().includes(logFilter.toLowerCase()) : true
  );

  const filteredEnvVars = (catalogItem?.defaultConfig?.envVars || []).filter((env) =>
    envFilter
      ? env.key.toLowerCase().includes(envFilter.toLowerCase()) ||
        env.value.toLowerCase().includes(envFilter.toLowerCase())
      : true
  );

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 px-1 gap-3">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExitClick}>
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
          <Button variant="secondary" size="sm" onClick={fetchLogs} isLoading={isFetchingLogs}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Logs
          </Button>
          <Button variant="secondary" size="sm" onClick={runTestProbe} isLoading={isTestingProbe}>
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
                  onClick={() => setFontSize("xs")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "xs" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Small Font"
                >
                  Aa-
                </button>
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "sm" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Medium Font"
                >
                  Aa
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === "base" ? "bg-white/10 text-white" : "text-slate-500"}`}
                  title="Large Font"
                >
                  Aa+
                </button>
              </div>

              {history.length > 0 && (
                <>
                  <button
                    onClick={downloadTerminalLogs}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md flex items-center gap-1"
                    title="Export Terminal Session Logs"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-[10px] font-bold">Export</span>
                  </button>

                  <button
                    onClick={() => setHistory([])}
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
                      onClick={() => copyToClipboard(item.output, idx)}
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
                  onClick={() => setCommand(hc.command)}
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
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command (e.g. kafka-topics.sh --list or SELECT 1; or PING)..."
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              disabled={isExecuting}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExecuteCommand()}
              isLoading={isExecuting}
              disabled={!command.trim()}
            >
              <Play className="h-3.5 w-3.5 mr-1" /> Run
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center border-b border-white/10 bg-slate-900">
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "logs"
                  ? "border-blue-500 text-blue-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Live Logs
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "help"
                  ? "border-emerald-500 text-emerald-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" /> CLI Help ({helpCommands.length})
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "specs"
                  ? "border-purple-500 text-purple-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Container Specs
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80">
            {activeTab === "logs" && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      placeholder="Filter log messages..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsAutoRefreshLogs(!isAutoRefreshLogs)}
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
                      onChange={(e) => setAutoScrollLogs(e.target.checked)}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                    <span>Auto-scroll to bottom</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "help" && (
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
                      onClick={() => setCommand(item.command)}
                      className="w-full text-left p-3 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral">{item.category}</Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteCommand(item.command);
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

            {activeTab === "specs" && (() => {
              const configJson = JSON.stringify(catalogItem?.defaultConfig || {}, null, 2);

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
                        {containerInfo.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Image Repository:</span>
                      <span className="text-blue-400 font-bold">{catalogItem?.image || imageId}:{catalogItem?.defaultTag || "latest"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Port Bindings:</span>
                      <span className="text-indigo-300 font-bold">{containerInfo.ports.join(", ") || "None"}</span>
                    </div>
                  </div>

                  {catalogItem?.defaultConfig?.envVars && catalogItem.defaultConfig.envVars.length > 0 && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Environment Variables ({filteredEnvVars.length})
                        </span>
                        <input
                          type="text"
                          value={envFilter}
                          onChange={(e) => setEnvFilter(e.target.value)}
                          placeholder="Search env..."
                          className="px-2 py-0.5 bg-slate-950 border border-white/10 rounded text-[10px] text-white focus:outline-none focus:border-blue-500 w-28"
                        />
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {filteredEnvVars.map((env, i) => (
                          <div key={i} className="flex flex-col gap-0.5 p-2 bg-slate-950 rounded-lg border border-white/5 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{env.key}</span>
                            <span className="text-slate-300 break-all text-[10px] leading-relaxed">{env.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          {testResult.healthy ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-400" />
                          )}
                          Health Probe: {testResult.healthy ? "HEALTHY" : "UNHEALTHY"}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{testResult.latencyMs} ms</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-white/5 break-all">
                        {testResult.message}
                      </p>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" onClick={runTestProbe} isLoading={isTestingProbe} className="w-full">
                    <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Re-run Health Probe
                  </Button>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configuration JSON</span>
                      <button
                        onClick={() => copyToClipboard(configJson, 999)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-white/5"
                      >
                        {copiedIdx === 999 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
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

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Leave Container Workspace?</h3>
              </div>
              <button onClick={() => setShowExitModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit the workspace for container <span className="font-bold text-white font-mono">{containerName}</span>?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleKeepRunningAndExit}
                className="w-full p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Keep Container Running & Return
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
              </button>

              <button
                onClick={handleProceedToStopCleanup}
                className="w-full p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-between transition-all"
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

      {showBackupModal && (() => {
        const backupRule = resolveBackupRule(imageId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <HardDriveDownload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Database Backup & Teardown</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Rules Engine: {backupRule.hasNativeBackup ? `Native ${backupRule.backupType.toUpperCase()} Engine` : "JSON Snapshot Engine"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowBackupModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {backupRule.hasNativeBackup ? (
                  <>
                    This container image (<span className="font-bold text-white">{imageId}</span>) supports <span className="font-bold text-emerald-400">Native Database Dump</span>. Would you like to export a full database <span className="font-mono text-emerald-300 font-bold">.{backupRule.fileExtension}</span> dump before deleting container <span className="font-bold text-white font-mono">{containerName}</span>?
                  </>
                ) : (
                  <>
                    Would you like to export a full container state backup (inspect configs, active logs, environment variables) before removing container <span className="font-bold text-white font-mono">{containerName}</span>?
                  </>
                )}
              </p>

              <div className="space-y-2.5 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConfirmDeleteContainer(true)}
                  isLoading={isDeleting}
                  className="w-full py-2.5"
                >
                  <HardDriveDownload className="h-4 w-4 mr-2" />
                  {backupRule.hasNativeBackup ? `Download .${backupRule.fileExtension} Dump & Remove` : "Backup State & Remove"}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleConfirmDeleteContainer(false)}
                  isLoading={isDeleting}
                  className="w-full py-2.5"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Without Backup
                </Button>

                <button
                  onClick={() => setShowBackupModal(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1"
                >
                  Cancel & Return
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
