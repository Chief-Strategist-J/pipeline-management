"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
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
  ExternalLink,
  Code,
  Sparkles,
} from "lucide-react";
import { DOCKER_HELP_COMMANDS, DEFAULT_HELP_COMMANDS, type HelpCommand } from "../../constants/docker-help.constants";
import { DOCKER_IMAGES_CATALOG } from "../../domain/docker-images.catalog";


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
  imageName = "Docker Service",
  onBackToLab,
}) => {
  const [activeTab, setActiveTab] = useState<"logs" | "help" | "specs">("logs");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<{ id: string; command: string; output: string; exitCode: number; timestamp: string }[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logFilter, setLogFilter] = useState("");
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingProbe, setIsTestingProbe] = useState(false);
  const [containerInfo, setContainerInfo] = useState<{ ports: string[]; env: Record<string, string>; status: string }>({
    ports: [],
    env: {},
    status: "running",
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const helpCommands = DOCKER_HELP_COMMANDS[imageId] || DEFAULT_HELP_COMMANDS;

  useEffect(() => {
    fetchContainerDetails();
    fetchLogs();
  }, [containerId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isExecuting]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchContainerDetails = async () => {
    try {
      const res = await fetch(`/api/docker-lab/containers`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.containers || []).find((c: any) => c.containerId === containerId || c.containerName === containerName);
        if (found) {
          setContainerInfo({
            ports: found.ports || [],
            env: found.env || {},
            status: found.status || "running",
          });
        }
      }
    } catch {
      // Fallback state intact
    }
  };

  const fetchLogs = async () => {
    setIsFetchingLogs(true);
    try {
      const res = await fetch(`/api/docker-lab/logs?containerId=${containerId}&tail=200`);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.logs || []);
      }
    } catch {
      // Keep state clean
    } finally {
      setIsFetchingLogs(false);
    }
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

  const filteredLogs = logs.filter((l) =>
    logFilter ? l.message.toLowerCase().includes(logFilter.toLowerCase()) : true
  );

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          {onBackToLab && (
            <Button variant="secondary" size="sm" onClick={onBackToLab}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Lab
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{containerName}</h2>
                <Badge variant="success">Container ID: {containerId.substring(0, 12)}</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Image: {imageId} | Strategy Engine: Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchLogs} isLoading={isFetchingLogs}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Logs
          </Button>
          <Button variant="secondary" size="sm" onClick={runTestProbe} isLoading={isTestingProbe}>
            <Activity className="h-3.5 w-3.5 mr-1 text-blue-400" /> Test Health
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Interactive Container Shell</span>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                3-Phase Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistory([])}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Clear Terminal Output"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 bg-slate-950/90">
            {history.length === 0 && (
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-2">
                <p className="text-emerald-400 font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Rules Engine Container Workspace Ready
                </p>
                <p className="text-slate-400 text-[11px]">
                  Type queries below or click any quick command from the side panel to execute. Commands are parsed and routed by the 3-Phase Rules Engine.
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
                      className="hover:text-white transition-colors"
                      title="Copy Output"
                    >
                      {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    item.exitCode === 0
                      ? "bg-slate-900/90 border-emerald-500/20 text-slate-200"
                      : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                  } whitespace-pre-wrap font-mono text-[11px] leading-relaxed break-all`}
                >
                  {item.output}
                </div>
              </div>
            ))}

            {isExecuting && (
              <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>Executing via Rules Engine...</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>

          <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-bold">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command (e.g. SELECT 1; or PING or show dbs)..."
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
              <Play className="h-3 w-3 mr-1" /> Run
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center border-b border-white/10 bg-slate-900">
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "logs"
                  ? "border-blue-500 text-blue-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Live Logs
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "help"
                  ? "border-emerald-500 text-emerald-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" /> CLI Help ({helpCommands.length})
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
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
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    placeholder="Filter logs..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex-1 bg-slate-900/90 rounded-xl border border-white/5 p-3 overflow-y-auto font-mono text-[11px] space-y-1">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-slate-300 hover:bg-white/5 py-0.5 px-1 rounded">
                        <span className="text-slate-600 select-none shrink-0">[{log.timestamp.substring(0, 19)}]</span>
                        <span className={log.stream === "stderr" ? "text-rose-400" : "text-emerald-300"}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 py-12 text-center">No logs found</div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <Code className="h-4 w-4" /> Quick Command Reference Cheat Sheet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click any command card to populate it into the prompt below, or click "Run Now" to execute immediately.
                  </p>
                </div>

                <div className="space-y-2">
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
                            className="px-2 py-0.5 text-[10px] font-bold bg-blue-600/30 hover:bg-blue-600/60 text-blue-200 border border-blue-500/30 rounded transition-all"
                            title="Execute Immediately"
                          >
                            Run Now
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-slate-300 mt-1.5 bg-slate-950 p-1.5 rounded border border-white/5 break-all">
                        {item.command}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "specs" && (() => {
              const catalogItem = DOCKER_IMAGES_CATALOG.find((img) => img.id === imageId);
              const configJson = JSON.stringify(catalogItem?.defaultConfig || {}, null, 2);

              return (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Instance Runtime</span>
                    <div className="flex justify-between text-slate-400">
                      <span>Container ID:</span>
                      <span className="text-white font-bold">{containerId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">{containerInfo.status}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Image Repository:</span>
                      <span className="text-blue-400">{catalogItem?.image || imageId}:{catalogItem?.defaultTag || "latest"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Port Bindings:</span>
                      <span className="text-indigo-300">{containerInfo.ports.join(", ") || "None"}</span>
                    </div>
                  </div>

                  {catalogItem?.defaultConfig?.envVars && catalogItem.defaultConfig.envVars.length > 0 && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-white/10 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Environment Variables</span>
                      <div className="space-y-1">
                        {catalogItem.defaultConfig.envVars.map((env, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-white/5 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{env.key}</span>
                            <span className="text-slate-300 break-all">{env.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          {testResult.healthy ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-400" />
                          )}
                          Health Status: {testResult.healthy ? "HEALTHY" : "UNHEALTHY"}
                        </span>
                        <span className="text-slate-400 font-mono">{testResult.latencyMs} ms</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-white/5">
                        {testResult.message}
                      </p>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" onClick={runTestProbe} isLoading={isTestingProbe} className="w-full">
                    <Activity className="h-3.5 w-3.5 mr-1 text-blue-400" /> Re-run Health Probe
                  </Button>

                  <div className="p-3 bg-slate-900 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configuration JSON</span>
                      <button
                        onClick={() => copyToClipboard(configJson, 999)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedIdx === 999 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48">
                      {configJson}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
