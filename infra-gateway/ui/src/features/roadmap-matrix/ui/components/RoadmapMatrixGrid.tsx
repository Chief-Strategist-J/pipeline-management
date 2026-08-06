"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/Badge";
import { CheckCircle2, ShieldAlert, Zap, Filter } from "lucide-react";
import { ROADMAP_FEATURES, type FeatureItem } from "../../domain/entities/feature-item.entity";

export const RoadmapMatrixGrid: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");

  const filteredFeatures = ROADMAP_FEATURES.filter((f) => {
    if (filter === "completed") return f.status === "completed";
    if (filter === "critical") return f.status === "critical";
    if (filter === "high") return f.status === "high";
    return true;
  });

  const completedCount = ROADMAP_FEATURES.filter((f) => f.status === "completed").length;

  const getStatusBadge = (status: FeatureItem["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed ✅</Badge>;
      case "critical":
        return <Badge variant="danger">Critical</Badge>;
      case "high":
        return <Badge variant="warning">High Priority</Badge>;
      default:
        return <Badge variant="neutral">Medium Priority</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Completed</p>
            <p className="text-xl font-bold text-emerald-400">{completedCount} / 25</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">OCSP Engine</p>
            <p className="text-xl font-bold text-blue-400">Feature #16</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Sandbox Generator</p>
            <p className="text-xl font-bold text-indigo-400">Feature #1</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Security Level</p>
            <p className="text-xl font-bold text-rose-400">Zero-Trust L7</p>
          </div>
        </GlassCard>
      </div>

      {/* Filter Bar */}
      <GlassCard className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Filter className="h-4 w-4 text-blue-400" />
          <span>25 Enterprise Critical Features Matrix</span>
        </div>

        <div className="flex items-center gap-2">
          {["all", "completed", "critical", "high"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feature) => (
          <GlassCard
            key={feature.id}
            glow={feature.status === "completed"}
            className="flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] text-slate-500 font-bold">#{feature.id}</span>
                {getStatusBadge(feature.status)}
              </div>
              <h3 className="font-bold text-sm text-slate-100">{feature.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feature.description}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-blue-400">{feature.category}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
