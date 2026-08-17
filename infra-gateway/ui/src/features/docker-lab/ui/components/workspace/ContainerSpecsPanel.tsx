"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { CheckCircle2, AlertCircle, Activity, Copy, Check } from "lucide-react";
import type { DockerImageEntity, DockerImage, TestResult, EnvVar } from "@/features/docker-lab/domain/entities/docker-image.entity";

interface ContainerSpecsPanelProps {
  containerId: string;
  imageId: string;
  containerInfo: { ports: string[]; env: Record<string, string>; status: string };
  catalogItem?: DockerImageEntity | DockerImage;
  filteredEnvVars: EnvVar[];
  envFilter: string;
  testResult: TestResult | null;
  isTestingProbe: boolean;
  copiedIdx: number | null;
  onEnvFilterChange: (val: string) => void;
  onRunTestProbe: () => void;
  onCopyClipboard: (text: string, idx: number) => void;
}

export const ContainerSpecsPanel: React.FC<ContainerSpecsPanelProps> = ({
  containerId,
  imageId,
  containerInfo,
  catalogItem,
  filteredEnvVars,
  envFilter,
  testResult,
  isTestingProbe,
  copiedIdx,
  onEnvFilterChange,
  onRunTestProbe,
  onCopyClipboard,
}) => {
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
              onChange={(e) => onEnvFilterChange(e.target.value)}
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

      <Button type="button" variant="secondary" size="sm" onClick={onRunTestProbe} isLoading={isTestingProbe} className="w-full">
        <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Re-run Health Probe
      </Button>

      <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configuration JSON</span>
          <button
            type="button"
            onClick={() => onCopyClipboard(configJson, 999)}
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
};
