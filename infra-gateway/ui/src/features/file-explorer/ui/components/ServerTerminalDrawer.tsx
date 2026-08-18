import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Play, Square, Terminal as TerminalIcon, Send, RefreshCw, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { resolveServerRunnerRule } from "../../rules/server-runner.rules";
import {
  selectIsServerRunning,
  selectTerminalLogs,
  selectTestResponse,
} from "../../readModels/file-explorer.selectors";
import {
  startServerAction,
  stopServerAction,
  sendTestRequestAction,
  clearTerminalLogs,
} from "../../state/file-explorer.slice";

interface ServerTerminalDrawerProps {
  activeTemplateId: string;
  isOpen: boolean;
  onToggle: () => void;
}

function renderTerminalLogWithLinks(log: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = log.split(urlRegex);

  return (
    <span>
      {parts.map((part: string, idx: number) => {
        if (part.match(/^https?:\/\//)) {
          return (
            <a
              key={idx}
              href={part}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-cyan-400 hover:text-cyan-200 underline font-bold transition-colors cursor-pointer inline-flex items-center gap-0.5 mx-1"
              title={`Open ${part} in new browser tab`}
            >
              <span>{part}</span>
              <ExternalLink className="h-3 w-3 inline shrink-0" />
            </a>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

export const ServerTerminalDrawer: React.FC<ServerTerminalDrawerProps> = ({
  activeTemplateId,
  isOpen,
}) => {
  const dispatch = useDispatch();

  const isRunning = useSelector(selectIsServerRunning);
  const logs = useSelector(selectTerminalLogs);
  const testResponse = useSelector(selectTestResponse);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [isMinimized, setIsMinimized] = useState(false);

  const meta = resolveServerRunnerRule(activeTemplateId);

  useEffect(() => {
    if (!isMinimized) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isMinimized]);

  const handleStartServer = () => {
    dispatch(startServerAction({ templateId: activeTemplateId }));
  };

  const handleStopServer = () => {
    dispatch(stopServerAction({ templateId: activeTemplateId }));
  };

  const handleSendTestRequest = () => {
    dispatch(sendTestRequestAction({ templateId: activeTemplateId }));
  };

  const handleClearLogs = () => {
    dispatch(clearTerminalLogs());
  };

  if (!isOpen) return null;

  return (
    <div className={`border-t border-[#2b2b2b] bg-[#141414] text-[#cccccc] flex flex-col font-mono text-xs select-none transition-all duration-200 ${isMinimized ? "h-9" : "h-48"}`}>
      <div className="h-9 px-4 bg-[#1f1f1f] border-b border-[#2b2b2b] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <TerminalIcon className="h-4 w-4 text-blue-400" />
            <span>Server Terminal: {meta.name}</span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {meta.lang}
          </span>

          {isRunning && (
            <a
              href={meta.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30 transition-colors shadow-sm text-xs"
              title="Click to open service URL in browser"
            >
              <span>{meta.url}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStartServer}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-all shadow-md cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Server ({meta.port})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopServer}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-all shadow-md cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop Server</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSendTestRequest}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-semibold border transition-all ${
              isRunning
                ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-400 cursor-pointer"
                : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Test Request</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className="p-1 hover:text-white text-slate-400 rounded cursor-pointer"
            title="Clear logs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:text-white text-slate-400 rounded cursor-pointer"
            title={isMinimized ? "Expand Terminal" : "Minimize Terminal"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-6 bg-[#0c0d10] custom-scrollbar flex min-h-0">
          <div className="flex-1 space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">
                [SYSTEM] Terminal initialized for {meta.name}. Click "Start Server" to run {meta.cmd}.
              </div>
            ) : (
              logs.map((log: string, idx: number) => (
                <div
                  key={idx}
                  className={
                    log.includes("🚀") || log.includes("SUCCESS")
                      ? "text-emerald-400 font-semibold"
                      : log.includes("ERROR") || log.includes("⏹")
                      ? "text-rose-400 font-semibold"
                      : log.includes("📡")
                      ? "text-amber-300 font-semibold"
                      : "text-slate-300"
                  }
                >
                  {renderTerminalLogWithLinks(log)}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {testResponse && (
            <div className="w-80 ml-4 p-3 bg-[#181818] border border-blue-500/30 rounded-lg overflow-y-auto text-xs text-blue-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-2 border-b border-white/10 pb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Live HTTP Response (200 OK)</span>
              </div>
              <pre className="font-mono text-[11px] whitespace-pre-wrap text-slate-300">
                {testResponse}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
