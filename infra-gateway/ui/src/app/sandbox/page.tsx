"use client";

import React from "react";
import { useSandbox, SandboxManager } from "@/features/sandbox-generator";

export default function SandboxPage() {
  const { sandboxes, isLoading, createSandbox, destroySandbox, fetchSandboxes } = useSandbox();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Dynamic Sandbox Environment Provisioner
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Launch and manage virtual test sandboxes with isolated bridge networks and mock backends.
        </p>
      </div>

      <SandboxManager
        sandboxes={sandboxes}
        isLoading={isLoading}
        onCreateSandbox={createSandbox}
        onDestroySandbox={destroySandbox}
        onRefresh={fetchSandboxes}
      />
    </div>
  );
}
