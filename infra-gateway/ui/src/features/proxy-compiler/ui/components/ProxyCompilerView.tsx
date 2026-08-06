"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Cpu, RefreshCw, CheckCircle2 } from "lucide-react";
import { CodeDiffViewer } from "./CodeDiffViewer";
import type { CompiledOutput } from "../../domain/entities/compiler.entity";

interface ProxyCompilerViewProps {
  output: CompiledOutput | null;
  isLoading: boolean;
  onCompile: (target: string) => void;
}

export const ProxyCompilerView: React.FC<ProxyCompilerViewProps> = ({ output, isLoading, onCompile }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard glow className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Multi-Proxy Config Compiler</h2>
              <Badge variant="success">Production Ready</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Translates abstract YAML routing definitions into Nginx, Apache, and Traefik reverse proxy configs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => onCompile("all")} isLoading={isLoading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Compile All Targets
          </Button>
        </div>
      </GlassCard>

      {/* Target Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onCompile("nginx")}
          className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-200 group-hover:text-blue-400 text-sm">Nginx Compiler</span>
            <Badge variant="info">nginx.conf</Badge>
          </div>
          <p className="text-[11px] text-slate-400">Compiles upstream zones, ssl_stapling, and location blocks</p>
        </button>

        <button
          onClick={() => onCompile("traefik")}
          className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-200 group-hover:text-indigo-400 text-sm">Traefik Compiler</span>
            <Badge variant="info">traefik.yaml</Badge>
          </div>
          <p className="text-[11px] text-slate-400">Compiles dynamic routers, middlewares, and ocspStapling</p>
        </button>

        <button
          onClick={() => onCompile("apache")}
          className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-200 group-hover:text-emerald-400 text-sm">Apache Compiler</span>
            <Badge variant="info">httpd.conf</Badge>
          </div>
          <p className="text-[11px] text-slate-400">Compiles VirtualHosts, mod_socache_shmcb, and SSLUseStapling</p>
        </button>
      </div>

      {/* Output Viewer */}
      <GlassCard>
        {output ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-xs text-slate-200">
                  Target: {output.target.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Compiled at {new Date(output.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <Badge variant="success">Syntax Valid</Badge>
            </div>

            <CodeDiffViewer files={output.files} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
            <Cpu className="h-10 w-10 text-slate-700 animate-pulse" />
            <p className="text-sm">No target compiled yet. Click "Compile All Targets" to generate proxy configurations.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
