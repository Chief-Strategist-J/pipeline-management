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

  const handleRunComboStack = async () => {
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
              onChange={(e) => setSelectedPresetId(e.target.value)}
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
            onClick={handleRunComboStack}
            isLoading={isExecuting}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-600/20"
          >
            <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Run Combo Stack ({presetConfigs.length})
          </Button>
        </div>
      </div>

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
