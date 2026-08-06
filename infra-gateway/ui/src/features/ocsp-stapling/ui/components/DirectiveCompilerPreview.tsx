"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Badge } from "@/shared/ui/Badge";
import { Code, Check, Copy } from "lucide-react";
import type { OCSPCompileResult } from "../../domain/entities/ocsp-policy.entity";

interface DirectiveCompilerPreviewProps {
  compiledDirectives: Record<string, OCSPCompileResult>;
  onCompileTarget: (target: string) => void;
}

export const DirectiveCompilerPreview: React.FC<DirectiveCompilerPreviewProps> = ({
  compiledDirectives,
  onCompileTarget,
}) => {
  const [activeTab, setActiveTab] = useState<"nginx" | "traefik" | "apache">("nginx");
  const [copied, setCopied] = useState(false);

  const targets: ("nginx" | "traefik" | "apache")[] = ["nginx", "traefik", "apache"];

  const handleTabChange = (target: "nginx" | "traefik" | "apache") => {
    setActiveTab(target);
    if (!compiledDirectives[target]) {
      onCompileTarget(target);
    }
  };

  const currentResult = compiledDirectives[activeTab];

  const handleCopy = () => {
    if (currentResult?.directives) {
      navigator.clipboard.writeText(currentResult.directives);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Code className="h-4 w-4 text-blue-400" />
          <span>Compiled Directive Output Preview</span>
        </div>
        <Badge variant={currentResult?.enabled ? "success" : "neutral"}>
          {currentResult?.enabled ? "Active Config Directives" : "Disabled Policy"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {targets.map((target) => (
            <button
              key={target}
              onClick={() => handleTabChange(target)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === target
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {target}
            </button>
          ))}
        </div>

        {currentResult?.directives && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Snippet"}</span>
          </button>
        )}
      </div>

      {/* Code Display */}
      <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800/80 overflow-x-auto min-h-[160px]">
        {currentResult?.directives ? (
          <pre className="text-emerald-400/90 leading-relaxed whitespace-pre-wrap">{currentResult.directives}</pre>
        ) : (
          <div className="flex items-center justify-center h-28 text-slate-500 italic">
            Click target proxy tab or enable OCSP Stapling to generate directives.
          </div>
        )}
      </div>
    </GlassCard>
  );
};
