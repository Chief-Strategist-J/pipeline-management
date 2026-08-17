"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { ArrowLeft, RefreshCw, Activity } from "lucide-react";

interface WorkspaceHeaderProps {
  containerId: string;
  containerName: string;
  imageId: string;
  isFetchingLogs: boolean;
  isTestingProbe: boolean;
  onExitClick: (e?: React.MouseEvent) => void;
  onRefreshLogs: () => void;
  onRunTestProbe: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  containerId,
  containerName,
  imageId,
  isFetchingLogs,
  isTestingProbe,
  onExitClick,
  onRefreshLogs,
  onRunTestProbe,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 px-1 gap-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onExitClick}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Lab
        </Button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-base shadow-lg shadow-emerald-500/10">
              ⚡
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight">{containerName}</h2>
              <Badge variant="success">ID: {containerId.substring(0, 12)}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Catalog Image: <span className="text-blue-400 font-bold">{imageId}</span> &bull; 3-Phase Rules Engine Active
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onRefreshLogs} isLoading={isFetchingLogs}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Logs
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRunTestProbe} isLoading={isTestingProbe}>
          <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Health Probe
        </Button>
      </div>
    </div>
  );
};
