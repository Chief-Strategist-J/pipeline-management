"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Trash2,
  HardDriveDownload,
  FileArchive,
  Database,
  FileText,
} from "lucide-react";
import type { BackupSelection } from "@/features/docker-lab/ui/hooks/useContainerWorkspace";
import type { BackupRuleResult } from "@/features/docker-lab/rules/docker-backup.rules";

interface TeardownModalProps {
  showExitModal: boolean;
  showBackupModal: boolean;
  containerName: string;
  imageId: string;
  backupRule: BackupRuleResult;
  selectedBackupOption: BackupSelection;
  isDeleting: boolean;
  onCloseExitModal: () => void;
  onKeepRunningAndExit: (e?: React.MouseEvent) => void;
  onProceedToStopCleanup: (e?: React.MouseEvent) => void;
  onCloseBackupModal: () => void;
  onSelectBackupOption: (opt: BackupSelection) => void;
  onConfirmTeardown: (e?: React.MouseEvent) => void;
}

export const TeardownModal: React.FC<TeardownModalProps> = ({
  showExitModal,
  showBackupModal,
  containerName,
  imageId,
  backupRule,
  selectedBackupOption,
  isDeleting,
  onCloseExitModal,
  onKeepRunningAndExit,
  onProceedToStopCleanup,
  onCloseBackupModal,
  onSelectBackupOption,
  onConfirmTeardown,
}) => {
  return (
    <>
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Leave Container Workspace?</h3>
              </div>
              <button type="button" onClick={onCloseExitModal} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit workspace for container <span className="font-bold text-white font-mono">{containerName}</span>?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onKeepRunningAndExit}
                className="w-full p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Keep Container Running & Return
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
              </button>

              <button
                type="button"
                onClick={onProceedToStopCleanup}
                className="w-full p-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" /> Stop & Cleanup Container
                </span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">Teardown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-400">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <HardDriveDownload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Select Backup & Teardown Option</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Target Container: {containerName} ({imageId})
                  </p>
                </div>
              </div>
              <button type="button" onClick={onCloseBackupModal} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label
                onClick={() => onSelectBackupOption("volume")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedBackupOption === "volume"
                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={selectedBackupOption === "volume"}
                  onChange={() => onSelectBackupOption("volume")}
                  className="mt-1 text-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <FileArchive className="h-4 w-4 text-amber-400" />
                    <span>Option 1: Complete Volume Storage Archive (.json / .tar.gz)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exports physical storage mount destinations, inspect specs, and active log streams.
                  </p>
                </div>
              </label>

              {backupRule.hasNativeBackup && (
                <label
                  onClick={() => onSelectBackupOption("native")}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedBackupOption === "native"
                      ? "bg-blue-600/20 border-blue-500/50 text-white"
                      : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="backupOption"
                    checked={selectedBackupOption === "native"}
                    onChange={() => onSelectBackupOption("native")}
                    className="mt-1 text-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>Option 2: Native Database Dump (.{backupRule.fileExtension})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Executes native CLI exporter <code className="text-emerald-300 font-mono">{backupRule.backupCommand}</code> directly inside container.
                    </p>
                  </div>
                </label>
              )}

              <label
                onClick={() => onSelectBackupOption("snapshot")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedBackupOption === "snapshot"
                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={selectedBackupOption === "snapshot"}
                  onChange={() => onSelectBackupOption("snapshot")}
                  className="mt-1 text-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span>Option 3: Container Snapshot State (.json)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exports inspect metadata, active logs, environment variables, and network status.
                  </p>
                </div>
              </label>

              <label
                onClick={() => onSelectBackupOption("none")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedBackupOption === "none"
                    ? "bg-rose-600/20 border-rose-500/50 text-white"
                    : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="backupOption"
                  checked={selectedBackupOption === "none"}
                  onChange={() => onSelectBackupOption("none")}
                  className="mt-1 text-rose-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Trash2 className="h-4 w-4 text-rose-400" />
                    <span>Option 4: Purge Container Without Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Deletes container immediately from local Docker daemon without generating backup.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant={selectedBackupOption === "none" ? "danger" : "primary"}
                size="sm"
                onClick={onConfirmTeardown}
                isLoading={isDeleting}
                className="flex-1 py-2.5"
              >
                <HardDriveDownload className="h-4 w-4 mr-2" /> Confirm & Execute Teardown
              </Button>

              <button
                type="button"
                onClick={onCloseBackupModal}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
