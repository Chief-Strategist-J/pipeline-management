"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { X, Box, Plus } from "lucide-react";
import type { CreateSandboxPayload } from "../../domain/entities/sandbox.entity";

interface CreateSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSandboxPayload) => void;
  isLoading: boolean;
}

export const CreateSandboxModal: React.FC<CreateSandboxModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [isolatedNetwork, setIsolatedNetwork] = useState(true);
  const [mocks, setMocks] = useState<string[]>(["redis"]);

  if (!isOpen) return null;

  const availableMocks = ["redis", "postgres", "nginx", "mock-auth"];

  const toggleMock = (mockName: string) => {
    setMocks((prev) =>
      prev.includes(mockName) ? prev.filter((m) => m !== mockName) : [...prev, mockName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      isolatedNetwork,
      mockDependencies: mocks,
    });
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <GlassCard className="w-full max-w-md space-y-5 border-blue-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Box className="h-5 w-5 text-blue-400" />
            <span>Provision New Sandbox</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Sandbox Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. integration-test-env-1"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="font-semibold text-slate-200">Isolated Network Namespace</p>
              <p className="text-[11px] text-slate-400">Creates private Docker bridge network</p>
            </div>
            <input
              type="checkbox"
              checked={isolatedNetwork}
              onChange={(e) => setIsolatedNetwork(e.target.checked)}
              className="h-4 w-4 rounded accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Mock Dependencies</label>
            <div className="grid grid-cols-2 gap-2">
              {availableMocks.map((mock) => {
                const isSelected = mocks.includes(mock);
                return (
                  <button
                    type="button"
                    key={mock}
                    onClick={() => toggleMock(mock)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                        : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span>{mock}</span>
                    {isSelected && <Plus className="h-3 w-3 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Provision Sandbox
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
