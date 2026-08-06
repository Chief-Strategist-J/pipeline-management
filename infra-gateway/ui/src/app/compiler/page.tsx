"use client";

import React from "react";
import { useCompiler, ProxyCompilerView } from "@/features/proxy-compiler";

export default function CompilerPage() {
  const { output, isLoading, compile } = useCompiler();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Multi-Proxy Compiler Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compile abstract routing rules and OCSP stapling policies into Nginx, Traefik, and Apache configurations.
        </p>
      </div>

      <ProxyCompilerView output={output} isLoading={isLoading} onCompile={compile} />
    </div>
  );
}
