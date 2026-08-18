"use client";

import React from "react";
import Link from "next/link";
import { FolderTree, ArrowRight, Sparkles } from "lucide-react";
import { RoadmapMatrixGrid } from "@/features/roadmap-matrix";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Infrastructure Gateway Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor enterprise routing capabilities, OCSP edge stapling status, and 25-feature security roadmap.
          </p>
        </div>

        <Link
          href="/explorer"
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 border border-blue-400/30 shrink-0"
        >
          <FolderTree className="h-4 w-4 text-blue-200" />
          <span>Launch File Explorer & Folder Generator</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <RoadmapMatrixGrid />
    </div>
  );
}

