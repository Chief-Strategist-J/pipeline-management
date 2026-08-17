"use client";

import React from "react";
import { FileText, HelpCircle, Settings } from "lucide-react";
import { useContainerWorkspace } from "../hooks/useContainerWorkspace";
import { WorkspaceHeader } from "./workspace/WorkspaceHeader";
import { TerminalShell } from "./workspace/TerminalShell";
import { LiveLogsPanel } from "./workspace/LiveLogsPanel";
import { CliHelpPanel } from "./workspace/CliHelpPanel";
import { ContainerSpecsPanel } from "./workspace/ContainerSpecsPanel";
import { TeardownModal } from "./workspace/TeardownModal";

interface ContainerWorkspaceProps {
  containerId: string;
  containerName: string;
  imageId?: string;
  imageName?: string;
  onBackToLab?: () => void;
}

export const ContainerWorkspace: React.FC<ContainerWorkspaceProps> = ({
  containerId,
  containerName,
  imageId = "default",
  onBackToLab,
}) => {
  const w = useContainerWorkspace(containerId, containerName, imageId, onBackToLab);

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col w-full">
      <WorkspaceHeader
        containerId={containerId}
        containerName={containerName}
        imageId={imageId}
        isFetchingLogs={w.isFetchingLogs}
        isTestingProbe={w.isTestingProbe}
        onExitClick={w.handleExitClick}
        onRefreshLogs={w.fetchLogs}
        onRunTestProbe={w.runTestProbe}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden">
        <TerminalShell
          history={w.history}
          command={w.command}
          isExecuting={w.isExecuting}
          fontSize={w.fontSize}
          copiedIdx={w.copiedIdx}
          helpCommands={w.helpCommands}
          terminalEndRef={w.terminalEndRef}
          onCommandChange={w.setCommand}
          onKeyDown={w.handleKeyDown}
          onExecuteCommand={w.handleExecuteCommand}
          onCopyOutput={w.copyToClipboard}
          onExportLogs={w.downloadTerminalLogs}
          onClearHistory={() => w.setHistory([])}
          onChangeFontSize={w.setFontSize}
        />

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center border-b border-white/10 bg-slate-900">
            <button
              type="button"
              onClick={() => w.setActiveTab("logs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "logs"
                  ? "border-blue-500 text-blue-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Live Logs
            </button>
            <button
              type="button"
              onClick={() => w.setActiveTab("help")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "help"
                  ? "border-emerald-500 text-emerald-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" /> CLI Help ({w.helpCommands.length})
            </button>
            <button
              type="button"
              onClick={() => w.setActiveTab("specs")}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                w.activeTab === "specs"
                  ? "border-purple-500 text-purple-400 bg-white/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Container Specs
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80">
            {w.activeTab === "logs" && (
              <LiveLogsPanel
                filteredLogs={w.filteredLogs}
                logFilter={w.logFilter}
                isAutoRefreshLogs={w.isAutoRefreshLogs}
                autoScrollLogs={w.autoScrollLogs}
                logsEndRef={w.logsEndRef}
                onLogFilterChange={w.setLogFilter}
                onToggleAutoRefresh={() => w.setIsAutoRefreshLogs(!w.isAutoRefreshLogs)}
                onToggleAutoScroll={w.setAutoScrollLogs}
              />
            )}

            {w.activeTab === "help" && (
              <CliHelpPanel
                helpCommands={w.helpCommands}
                onSelectCommand={w.setCommand}
                onExecuteCommand={w.handleExecuteCommand}
              />
            )}

            {w.activeTab === "specs" && (
              <ContainerSpecsPanel
                containerId={containerId}
                imageId={imageId}
                containerInfo={w.containerInfo}
                catalogItem={w.catalogItem}
                filteredEnvVars={w.filteredEnvVars}
                envFilter={w.envFilter}
                testResult={w.testResult}
                isTestingProbe={w.isTestingProbe}
                copiedIdx={w.copiedIdx}
                onEnvFilterChange={w.setEnvFilter}
                onRunTestProbe={w.runTestProbe}
                onCopyClipboard={w.copyToClipboard}
              />
            )}
          </div>
        </div>
      </div>

      <TeardownModal
        showExitModal={w.showExitModal}
        showBackupModal={w.showBackupModal}
        containerName={containerName}
        imageId={imageId}
        backupRule={w.backupRule}
        selectedBackupOption={w.selectedBackupOption}
        isDeleting={w.isDeleting}
        onCloseExitModal={() => w.setShowExitModal(false)}
        onKeepRunningAndExit={w.handleKeepRunningAndExit}
        onProceedToStopCleanup={w.handleProceedToStopCleanup}
        onCloseBackupModal={() => w.setShowBackupModal(false)}
        onSelectBackupOption={w.setSelectedBackupOption}
        onConfirmTeardown={w.handleConfirmTeardown}
      />
    </div>
  );
};
