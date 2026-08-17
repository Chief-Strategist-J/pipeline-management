"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import {
  Layers,
  Network,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  Server,
  Activity,
  Code,
  Sparkles,
} from "lucide-react";
import {
  resolveOrchestrationPlan,
  type OrchestratedStackPlan,
} from "@/features/docker-lab/rules/docker-orchestration.rules";
import type { ContainerConfig } from "@/features/docker-lab/domain/entities/docker-image.entity";

interface MultiStackOrchestratorModalProps {
  isOpen: boolean;
  selectedConfigs: ContainerConfig[];
  onClose: () => void;
  onLaunchSuccess: () => void;
}

export const MultiStackOrchestratorModal: React.FC<MultiStackOrchestratorModalProps> = ({
  isOpen,
  selectedConfigs,
  onClose,
  onLaunchSuccess,
}) => {
  const [networkName, setNetworkName] = useState("shared-lab-net");
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentExecutingPhase, setCurrentExecutingPhase] = useState<number | null>(null);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const plan: OrchestratedStackPlan = useMemo(() => {
    return resolveOrchestrationPlan(selectedConfigs, networkName);
  }, [selectedConfigs, networkName]);

  if (!isOpen) return null;

  const handleLaunchPipeline = async () => {
    setIsLaunching(true);
    setLaunchError(null);
    setCompletedPhases([]);

    try {
      for (const phase of plan.phases) {
        setCurrentExecutingPhase(phase.phaseIndex);

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

      setTimeout(() => {
        setIsLaunching(false);
        onLaunchSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setLaunchError(err.message || "Multi-stack orchestration failed");
      setIsLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-blue-400">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Multi-Container Stack Orchestrator</h2>
              <p className="text-xs text-slate-400">
                Rules Engine DAG Topology & Cross-Service Auto-Wiring ({selectedConfigs.length} images selected)
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" disabled={isLaunching}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="p-4 bg-slate-950 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Network className="h-4 w-4 text-emerald-400" />
              <span>Shared Bridge Network:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="Network name..."
                className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-48"
                disabled={isLaunching}
              />
              <Badge variant="success">Bridge DNS Active</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              Execution Phases ({plan.phases.length} Phases Resolved)
            </span>

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
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <Activity className="h-5 w-5 text-blue-400 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {phase.phaseIndex}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{phase.phaseName}</h4>
                        <p className="text-[11px] text-slate-400">{phase.description}</p>
                      </div>
                    </div>
                    <Badge variant={isDone ? "success" : isCurrent ? "info" : "neutral"}>
                      {phase.configs.length} Containers
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

          {launchError && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{launchError}</span>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-white" disabled={isLaunching}>
            Cancel
          </button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleLaunchPipeline}
            isLoading={isLaunching}
            className="px-6 py-2.5"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLaunching ? `Executing Phase ${currentExecutingPhase}...` : "🚀 Launch Ordered Stack Pipeline"}
          </Button>
        </div>
      </div>
    </div>
  );
};
