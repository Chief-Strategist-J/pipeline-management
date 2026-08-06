"use client";

import React from "react";
import { RoadmapMatrixGrid } from "@/features/roadmap-matrix";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Infrastructure Gateway Overview
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor enterprise routing capabilities, OCSP edge stapling status, and 25-feature security roadmap.
        </p>
      </div>

      <RoadmapMatrixGrid />
    </div>
  );
}
