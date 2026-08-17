"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import {
  Layers,
  Play,
  Download,
  CheckCircle2,
  AlertCircle,
  Zap,
  Server,
  Code,
  Network,
  ArrowLeft,
  Copy,
  Check,
  Activity,
  Terminal,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  PRODUCTION_STACK_PRESETS,
  resolvePresetStackConfigs,
  generateDeployScript,
  type ProductionStackPreset,
} from "@/features/docker-lab/rules/docker-stack-preset.rules";
import { resolveOrchestrationPlan } from "@/features/docker-lab/rules/docker-orchestration.rules";

interface MultiStackDashboardProps {
  onBackToLab?: () => void;
}

export const MultiStackDashboard: React.FC<MultiStackDashboardProps> = ({ onBackToLab }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRODUCTION_STACK_PRESETS[0].id);
  const [networkName, setNetworkName] = useState("shared-lab-net");
  const [showApprovalBox, setShowApprovalBox] = useState(false);
  const [approvalTab, setApprovalTab] = useState<"cli" | "env" | "json">("cli");
  const [copiedCmdIdx, setCopiedCmdIdx] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutingPhase, setCurrentExecutingPhase] = useState<number | null>(null);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [execStatus, setExecStatus] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);

  const selectedPreset: ProductionStackPreset = useMemo(() => {
    return (
      PRODUCTION_STACK_PRESETS.find((p) => p.id === selectedPresetId) ||
      PRODUCTION_STACK_PRESETS[0]
    );
  }, [selectedPresetId]);

  const presetConfigs = useMemo(() => {
    return resolvePresetStackConfigs(selectedPreset.id);
  }, [selectedPreset]);

  const plan = useMemo(() => {
    return resolveOrchestrationPlan(presetConfigs, networkName);
  }, [presetConfigs, networkName]);

  const generatedScript = useMemo(() => {
    return generateDeployScript(plan);
  }, [plan]);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCmdIdx(idx);
    setTimeout(() => setCopiedCmdIdx(null), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([generatedScript], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deploy-${selectedPreset.id}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApproveAndRunComboStack = async () => {
    setShowApprovalBox(false);
    setIsExecuting(true);
    setExecError(null);
    setCompletedPhases([]);
    setExecStatus(`Initializing ${selectedPreset.name}...`);

    try {
      for (const phase of plan.phases) {
        setCurrentExecutingPhase(phase.phaseIndex);
        setExecStatus(`Executing ${phase.phaseName}...`);

        const res = await fetch("/api/docker-lab/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            networkName: plan.networkName,
            configs: phase.configs,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `Phase ${phase.phaseIndex} execution failed`);
        }

        setCompletedPhases((prev) => [...prev, phase.phaseIndex]);
      }

      setExecStatus(`✅ Stack ${selectedPreset.name} running on network ${networkName}!`);
      setTimeout(() => {
        setIsExecuting(false);
        setExecStatus(null);
        setCurrentExecutingPhase(null);
      }, 2000);
    } catch (err: any) {
      setExecError(err.message || "Multi-stack execution failed");
      setIsExecuting(false);
      setCurrentExecutingPhase(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1920px] mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          {onBackToLab && (
            <Button type="button" variant="secondary" size="sm" onClick={onBackToLab}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Catalog
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-blue-500/10">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Multi-Stack Production Orchestration Studio
                </h1>
                <Badge variant="info">3-Phase Rules Engine Active</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a production combination to inspect DAG launch phases, cross-container OTEL/Kafka environment overrides, and generate executable shell scripts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadScript}
            className="text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-indigo-400" /> Export deploy-stack.sh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowApprovalBox(true)}
            isLoading={isExecuting}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-400 px-5 shadow-xl shadow-emerald-600/20"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {isLaunchingText(isExecuting, currentExecutingPhase, selectedPreset.name)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {PRODUCTION_STACK_PRESETS.map((preset) => {
          const isActive = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setSelectedPresetId(preset.id);
                setShowApprovalBox(false);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-blue-600/20 border-blue-500 text-white shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/50"
                  : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{preset.icon}</span>
                  <Badge variant={isActive ? "info" : "neutral"}>{preset.badge}</Badge>
                </div>
                <h3 className="text-xs font-extrabold text-white leading-tight">{preset.name}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-emerald-400 font-bold">
                {preset.imageIds.length} Images Configured
              </div>
            </button>
          );
        })}
      </div>

      {showApprovalBox && (
        <GlassCard className="p-5 border border-amber-500/40 bg-slate-900/95 space-y-4 animate-in fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Pre-Flight Docker Configuration Review & Approval Inspector</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setApprovalTab("cli")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${approvalTab === "cli" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  CLI Commands
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalTab("env")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${approvalTab === "env" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  Ports & Env Vars
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalTab("json")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${approvalTab === "json" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  Payload JSON
                </button>
              </div>

              <button type="button" onClick={() => setShowApprovalBox(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {approvalTab === "cli" && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 font-mono text-[11px]">
                {plan.phases.map((phase) => (
                  <div key={phase.phaseIndex} className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">{phase.phaseName}</span>
                    {phase.configs.map((cfg, idx) => {
                      const portsStr = (cfg.ports || []).map((p) => `-p ${p.hostPort}:${p.containerPort}/${p.protocol || "tcp"}`).join(" ");
                      const envStr = (cfg.envVars || []).map((e) => `-e "${e.key}=${e.value}"`).join(" ");
                      const cmd = `docker run -d --name ${cfg.imageId}-node --network ${networkName} --network-alias ${cfg.imageId} ${portsStr} ${envStr} ${cfg.imageId}:${cfg.tag || "latest"}`;

                      return (
                        <div key={cfg.imageId} className="p-2 bg-slate-900 rounded-lg border border-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-400 font-bold">{cfg.imageId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(cmd, idx)}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedCmdIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>Copy Command</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-300 break-all leading-relaxed bg-slate-950 p-2 rounded">
                            {cmd}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {approvalTab === "env" && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {plan.orderedConfigs.map((cfg) => (
                  <div key={cfg.imageId} className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{cfg.imageId}</span>
                      <span className="text-[10px] text-indigo-300 font-mono">
                        Ports: {(cfg.ports || []).map((p) => `${p.hostPort}:${p.containerPort}`).join(", ") || "Bridge Dynamic"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(cfg.envVars || []).map((env, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] font-mono text-emerald-300">
                          {env.key}={env.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {approvalTab === "json" && (
              <pre className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(plan, null, 2)}
              </pre>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Target Network: <span className="text-emerald-400 font-bold">{networkName}</span> &bull; Containers: <span className="text-white font-bold">{plan.orderedConfigs.length}</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowApprovalBox(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleApproveAndRunComboStack}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-400 px-6 py-2.5"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Execute Stack Pipeline
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <GlassCard className="p-5 space-y-4 bg-slate-900/90 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>Topological Execution Phases ({plan.phases.length} Phases Resolved)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono">Bridge Network:</span>
                <input
                  type="text"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-36"
                />
              </div>
            </div>

            <div className="space-y-3">
              {plan.phases.map((phase) => {
                const isCurrent = currentExecutingPhase === phase.phaseIndex;
                const isDone = completedPhases.includes(phase.phaseIndex);

                return (
                  <div
                    key={phase.phaseIndex}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-blue-600/15 border-blue-500/50"
                        : isDone
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-slate-950 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <Activity className="h-5 w-5 text-blue-400 animate-spin shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                            {phase.phaseIndex}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-extrabold text-white">{phase.phaseName}</h4>
                          <p className="text-[11px] text-slate-400">{phase.description}</p>
                        </div>
                      </div>
                      <Badge variant={isDone ? "success" : isCurrent ? "info" : "neutral"}>
                        {phase.configs.length} Nodes
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {phase.configs.map((cfg) => {
                        const overrides = plan.envOverrides[cfg.imageId] || {};
                        const hasOverrides = Object.keys(overrides).length > 0;

                        return (
                          <div
                            key={cfg.imageId}
                            className="px-3 py-1.5 bg-slate-900 rounded-lg border border-white/10 text-[11px] flex items-center gap-2"
                          >
                            <Server className="h-3.5 w-3.5 text-blue-400" />
                            <span className="font-bold text-white font-mono">{cfg.imageId}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({cfg.imageId}:{cfg.tag || "latest"})</span>
                            {hasOverrides && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-mono" title={JSON.stringify(overrides)}>
                                Auto-Wired
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {execStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{execStatus}</span>
              </div>
            )}

            {execError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{execError}</span>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-4">
          <GlassCard className="p-5 space-y-3 bg-slate-900/90 border border-white/10 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Generated bash script (deploy-stack.sh)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                >
                  {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="text-[10px] font-bold">{copiedScript ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadScript}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold">Download</span>
                </button>
              </div>
            </div>

            <pre className="flex-1 p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-[11px] text-emerald-300 overflow-x-auto overflow-y-auto leading-relaxed max-h-[500px]">
              {generatedScript}
            </pre>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

function isLaunchingText(isExecuting: boolean, currentPhase: number | null, name: string): string {
  if (!isExecuting) return `Review & Approve ${name}`;
  if (currentPhase) return `Executing Phase ${currentPhase}...`;
  return "Deploying Stack...";
}
