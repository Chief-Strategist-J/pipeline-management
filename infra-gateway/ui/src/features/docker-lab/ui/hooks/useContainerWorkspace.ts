import { useState, useEffect, useRef } from "react";
import { DOCKER_HELP_COMMANDS, DEFAULT_HELP_COMMANDS, type HelpCommand } from "../../constants/docker-help.constants";
import { DOCKER_IMAGES_CATALOG } from "../../domain/docker-images.catalog";
import { resolveBackupRule, type BackupRuleResult } from "../../rules/docker-backup.rules";
import type { LogLine, TestResult } from "../../domain/entities/docker-image.entity";

export type BackupSelection = "volume" | "native" | "snapshot" | "none";

export function useContainerWorkspace(
  containerId: string,
  containerName: string,
  imageId: string = "default",
  onBackToLab?: () => void
) {
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
  const [selectedBackupOption, setSelectedBackupOption] = useState<BackupSelection>("volume");
  const [isDeleting, setIsDeleting] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const helpCommands: HelpCommand[] = DOCKER_HELP_COMMANDS[imageId] || DEFAULT_HELP_COMMANDS;
  const catalogItem = DOCKER_IMAGES_CATALOG.find((img) => img.id === imageId);
  const backupRule: BackupRuleResult = resolveBackupRule(imageId);

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
      // Intact
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
      // Intact
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
        const healthyVal = data.healthy ?? data.success ?? true;
        setTestResult({
          containerId,
          success: healthyVal,
          healthy: healthyVal,
          message: data.message || "Health check completed",
          latencyMs: data.latencyMs || 0,
          testedAt: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      setTestResult({
        containerId,
        success: false,
        healthy: false,
        message: err.message || "Test probe failed",
        latencyMs: 0,
        testedAt: new Date().toLocaleTimeString(),
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

  const handleExitClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowExitModal(true);
  };

  const handleKeepRunningAndExit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowExitModal(false);
    if (onBackToLab) onBackToLab();
  };

  const handleProceedToStopCleanup = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowExitModal(false);
    setShowBackupModal(true);
  };

  const handleConfirmTeardown = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsDeleting(true);
    try {
      const modeParam = selectedBackupOption;
      const res = await fetch(`/api/docker-lab/containers?containerId=${containerId}&backupMode=${modeParam}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.backupContent && data.backupFilename) {
          const blob = new Blob([data.backupContent], { type: data.mimeType || "application/octet-stream" });
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

  return {
    activeTab,
    setActiveTab,
    command,
    setCommand,
    history,
    setHistory,
    historyIdx,
    isExecuting,
    copiedIdx,
    fontSize,
    setFontSize,
    logs,
    logFilter,
    setLogFilter,
    isFetchingLogs,
    isAutoRefreshLogs,
    setIsAutoRefreshLogs,
    autoScrollLogs,
    setAutoScrollLogs,
    envFilter,
    setEnvFilter,
    testResult,
    isTestingProbe,
    containerInfo,
    showExitModal,
    setShowExitModal,
    showBackupModal,
    setShowBackupModal,
    selectedBackupOption,
    setSelectedBackupOption,
    isDeleting,
    terminalEndRef,
    logsEndRef,
    helpCommands,
    catalogItem,
    backupRule,
    filteredLogs,
    filteredEnvVars,
    fetchLogs,
    runTestProbe,
    handleExecuteCommand,
    handleKeyDown,
    copyToClipboard,
    downloadTerminalLogs,
    handleExitClick,
    handleKeepRunningAndExit,
    handleProceedToStopCleanup,
    handleConfirmTeardown,
  };
}
