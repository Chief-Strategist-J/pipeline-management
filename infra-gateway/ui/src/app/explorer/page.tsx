"use client";

import React from "react";
import { OpenVSCodeWorkspace } from "@/features/file-explorer";

export default function ExplorerPage() {
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden m-0 p-0">
      <OpenVSCodeWorkspace />
    </div>
  );
}
