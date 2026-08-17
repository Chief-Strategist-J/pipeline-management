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
  ChevronDown,
  Terminal,
  ShieldCheck,
  X,
  Copy,
  Check,
} from "lucide-react";
import {
  PRODUCTION_STACK_PRESETS,
  resolvePresetStackConfigs,
  generateDeployScript,
  type ProductionStackPreset,
} from "@/features/docker-lab/rules/docker-stack-preset.rules";
import { resolveOrchestrationPlan } from "@/features/docker-lab/rules/docker-orchestration.rules";

interface ProductionComboSelectorProps {
  onStackLaunched: () => void;
}

export const ProductionComboSelector: React.FC<ProductionComboSelectorProps> = ({
  onStackLaunched,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRODUCTION_STACK_PRESETS[0].id);
  const [networkName, setNetworkName] = useState("shared-lab-net");
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [approvalTab, setApprovalTab] = useState<"cli" | "env" | "json">("cli");
  const [copiedCmdIdx, setCopiedCmdIdx] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
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

  const handleDownloadScript = () => {
    const scriptText = generateDeployScript(plan);
    const blob = new Blob([scriptText], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deploy-${selectedPreset.id}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCmdIdx(idx);
    setTimeout(() => setCopiedCmdIdx(null), 2000);
  };

  const handleApproveAndExecute = async () => {
    setShowApprovalPanel(false);
    setIsExecuting(true);
    setExecError(null);
    setExecStatus(`Initializing ${selectedPreset.name}...`);

    try {
      for (const phase of plan.phases) {
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
      }

      setExecStatus(`✅ Stack ${selectedPreset.name} running on network ${networkName}!`);
      setTimeout(() => {
        setIsExecuting(false);
        setExecStatus(null);
        onStackLaunched();
      }, 1500);
    } catch (err: any) {
      setExecError(err.message || "Combo stack execution failed");
      setIsExecuting(false);
    }
  };

  return (
    <GlassCard className="p-5 space-y-4 border border-blue-500/20 bg-slate-900/90 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-extrabold text-lg">
            {selectedPreset.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                Production Combination Stack Combobox
              </h3>
              <Badge variant="info">{selectedPreset.badge}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedPreset.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setShowApprovalPanel(false);
              }}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-950 border border-white/10 hover:border-blue-500/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {PRODUCTION_STACK_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                  {preset.icon} {preset.name} ({preset.imageIds.length} images)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadScript}
            className="text-xs"
            title="Download Executable deploy-stack.sh Bash Script"
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Export deploy-stack.sh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowApprovalPanel(true)}
            isLoading={isExecuting}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-600/20"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Review & Approve Stack ({presetConfigs.length})
          </Button>
        </div>
      </div>

      {!showApprovalPanel ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {plan.phases.map((phase) => (
            <div key={phase.phaseIndex} className="p-3 bg-slate-950/90 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  Phase {phase.phaseIndex}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{phase.configs.length} nodes</span>
              </div>
              <p className="text-[11px] font-bold text-white truncate">{phase.phaseName.split(":")[1] || phase.phaseName}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {phase.configs.map((c) => (
                  <span key={c.imageId} className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] font-mono text-slate-300">
                    {c.imageId}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-4 animate-in fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Pre-Flight Docker Configuration Approval Inspector</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setApprovalTab("cli")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${approvalTab === "cli" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  CLI Commands
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalTab("env")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${approvalTab === "env" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  Ports & Env Vars
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalTab("json")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${approvalTab === "json" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  Payload JSON
                </button>
              </div>

              <button type="button" onClick={() => setShowApprovalPanel(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {approvalTab === "cli" && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {plan.phases.map((phase) => (
                  <div key={phase.phaseIndex} className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">{phase.phaseName}</span>
                    {phase.configs.map((cfg, idx) => {
                      const portsStr = (cfg.ports || []).map((p) => `-p ${p.hostPort}:${p.containerPort}/${p.protocol || "tcp"}`).join(" ");
                      const envStr = (cfg.envVars || []).map((e) => `-e "${e.key}=${e.value}"`).join(" ");
                      const cmd = `docker run -d --name ${cfg.imageId}-node --network ${networkName} --network-alias ${cfg.imageId} ${portsStr} ${envStr} ${cfg.imageId}:${cfg.tag || "latest"}`;

                      return (
                        <div key={cfg.imageId} className="p-2 bg-slate-950 rounded-lg border border-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-emerald-400 font-bold">{cfg.imageId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(cmd, idx)}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedCmdIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>Copy CLI</span>
                            </button>
                          </div>
                          <p className="text-[10px] font-mono text-slate-300 break-all leading-relaxed bg-slate-900/60 p-2 rounded">
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
                  <div key={cfg.imageId} className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{cfg.imageId}</span>
                      <span className="text-[10px] text-indigo-300 font-mono">
                        Ports: {(cfg.ports || []).map((p) => `${p.hostPort}:${p.containerPort}`).join(", ") || "Bridge Dynamic"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(cfg.envVars || []).map((env, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-950 border border-white/10 rounded text-[10px] font-mono text-emerald-300">
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
              Network: <span className="text-emerald-400 font-bold">{networkName}</span> &bull; Containers: <span className="text-white font-bold">{plan.orderedConfigs.length}</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowApprovalPanel(false)}
                className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApproveAndExecute}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-400 px-5"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Execute Stack Pipeline
              </Button>
            </div>
          </div>
        </div>
      )}

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
  );
};
