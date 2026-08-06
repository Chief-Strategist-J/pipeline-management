"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { ShieldCheck, Server, Zap, RefreshCw } from "lucide-react";
import type { OCSPStaplingPolicy } from "../../domain/entities/ocsp-policy.entity";

interface OCSPControlPanelProps {
  policy: OCSPStaplingPolicy | null;
  isLoading: boolean;
  onUpdatePolicy: (policy: OCSPStaplingPolicy) => void;
  onRefresh: () => void;
}

export const OCSPControlPanel: React.FC<OCSPControlPanelProps> = ({
  policy,
  isLoading,
  onUpdatePolicy,
  onRefresh,
}) => {
  if (!policy) {
    return (
      <GlassCard className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
          <span>Loading OCSP Stapling Policy...</span>
        </div>
      </GlassCard>
    );
  }

  const toggleEnabled = () => {
    onUpdatePolicy({
      ...policy,
      enabled: !policy.enabled,
    });
  };

  const toggleVerify = () => {
    onUpdatePolicy({
      ...policy,
      verify: !policy.verify,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <GlassCard glow={policy.enabled} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border backdrop-blur-xl ${
            policy.enabled
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/20"
              : "bg-slate-800/50 text-slate-500 border-slate-700/50"
          }`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">OCSP Stapling Engine</h2>
              <Badge variant={policy.enabled ? "success" : "neutral"}>
                {policy.enabled ? "Active on Edge" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automatically pre-fetches and staples CA revocation statuses to eliminate TLS handshake latency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={onRefresh} isLoading={isLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reload Policy
          </Button>
          <Button
            variant={policy.enabled ? "danger" : "primary"}
            size="sm"
            onClick={toggleEnabled}
            isLoading={isLoading}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            {policy.enabled ? "Disable Engine" : "Enable Engine"}
          </Button>
        </div>
      </GlassCard>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification & Resolver */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold text-sm">
            <Server className="h-4 w-4" />
            <h3>Resolver & Verification Settings</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <p className="font-semibold text-slate-200">OCSP Response Verification</p>
                <p className="text-slate-400 text-[11px]">Validates CA digital signatures before caching</p>
              </div>
              <button
                onClick={toggleVerify}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  policy.verify ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    policy.verify ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <p className="font-semibold text-slate-200">DNS Nameservers</p>
              <div className="flex gap-2">
                {policy.resolver.nameservers.map((ns, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 rounded-md font-mono text-slate-300 border border-slate-700/50">
                    {ns}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <p className="text-slate-400 text-[10px]">Valid Duration</p>
                <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{policy.resolver.validDuration}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <p className="text-slate-400 text-[10px]">Lookup Timeout</p>
                <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{policy.resolver.timeout}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Cache Storage Settings */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-semibold text-sm">
            <Zap className="h-4 w-4" />
            <h3>Cache Storage Architecture</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-200">Cache Type</p>
                <p className="text-slate-400 text-[11px]">Shared memory zone across worker threads</p>
              </div>
              <Badge variant="info">{policy.cache.type.toUpperCase()}</Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-slate-400 text-[10px]">Shared Zone Name</p>
              <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{policy.cache.sharedZoneName}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-slate-400 text-[10px]">Shared Zone Memory Size</p>
              <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{policy.cache.sharedZoneSize}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
