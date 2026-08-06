"use client";

import React from "react";
import { useOCSP, OCSPControlPanel, DirectiveCompilerPreview } from "@/features/ocsp-stapling";

export default function OCSPPage() {
  const { policy, isLoading, updatePolicy, fetchPolicy, compiledDirectives, compileTarget } = useOCSP();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          OCSP Stapling Engine Control Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage CA revocation pre-fetching policy and preview generated Nginx, Traefik, and Apache directives.
        </p>
      </div>

      <OCSPControlPanel
        policy={policy}
        isLoading={isLoading}
        onUpdatePolicy={updatePolicy}
        onRefresh={fetchPolicy}
      />

      <DirectiveCompilerPreview
        compiledDirectives={compiledDirectives}
        onCompileTarget={compileTarget}
      />
    </div>
  );
}
