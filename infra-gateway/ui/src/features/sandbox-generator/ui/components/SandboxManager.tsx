"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Box, Plus, Trash2, Network, RefreshCw } from "lucide-react";
import { CreateSandboxModal } from "./CreateSandboxModal";
import type { Sandbox, CreateSandboxPayload } from "../../domain/entities/sandbox.entity";

interface SandboxManagerProps {
  sandboxes: Sandbox[];
  isLoading: boolean;
  onCreateSandbox: (payload: CreateSandboxPayload) => void;
  onDestroySandbox: (sandboxId: string) => void;
  onRefresh: () => void;
}

export const SandboxManager: React.FC<SandboxManagerProps> = ({
  sandboxes,
  isLoading,
  onCreateSandbox,
  onDestroySandbox,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard glow className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Dynamic Sandbox Generator</h2>
              <Badge variant="info">{sandboxes.length} Active</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Provisions isolated Docker bridge networks and mock backends (redis, postgres, nginx) on demand.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onRefresh} isLoading={isLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Sandbox
          </Button>
        </div>
      </GlassCard>

      {/* Sandbox Grid */}
      {sandboxes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sandboxes.map((sb) => (
            <GlassCard key={sb.sandboxId} className="space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{sb.name}</h3>
                    <Badge variant={sb.status === "active" ? "success" : "warning"}>{sb.status}</Badge>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{sb.sandboxId}</p>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDestroySandbox(sb.sandboxId)}
                  className="opacity-90 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Network className="h-3.5 w-3.5 text-blue-400" />
                    Namespace:
                  </span>
                  <span className="font-mono font-semibold text-slate-200">{sb.namespace}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Isolated Network:</span>
                  <span className="font-semibold text-emerald-400">{sb.isolatedNetwork ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Mock Services:</span>
                  <div className="flex gap-1">
                    {sb.mockDependencies.map((mock) => (
                      <span key={mock} className="px-2 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-indigo-300 border border-indigo-500/20">
                        {mock}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
          <Box className="h-10 w-10 text-slate-700" />
          <p className="text-sm">No active sandbox environments. Click "New Sandbox" to provision one.</p>
        </GlassCard>
      )}

      {/* Modal */}
      <CreateSandboxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(payload) => {
          onCreateSandbox(payload);
          setIsModalOpen(false);
        }}
        isLoading={isLoading}
      />
    </div>
  );
};
