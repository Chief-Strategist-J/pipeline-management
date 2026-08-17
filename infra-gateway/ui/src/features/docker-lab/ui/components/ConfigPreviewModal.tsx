"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { X, Copy, Check, Download, FileCode, Terminal } from "lucide-react";
import type { ContainerConfig } from "../../domain/entities/docker-image.entity";
import { DOCKER_IMAGES_CATALOG } from "../../domain/docker-images.catalog";

function generateDockerComposeYaml(configs: ContainerConfig[]): string {
  let yaml = "version: '3.8'\n\nservices:\n";
  const usedNames = new Set<string>();

  configs.forEach((config, idx) => {
    const image = DOCKER_IMAGES_CATALOG.find((i) => i.id === config.imageId);
    let baseName = (config.containerName || config.imageId).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    
    let serviceName = baseName;
    let counter = 2;
    while (usedNames.has(serviceName)) {
      serviceName = `${baseName}_${counter}`;
      counter++;
    }
    usedNames.add(serviceName);

    yaml += `  ${serviceName}:\n`;
    yaml += `    image: ${image?.image || config.imageId}:${config.tag || "latest"}\n`;
    yaml += `    container_name: dlab-${serviceName}\n`;

    if (config.ports && config.ports.length > 0) {
      yaml += `    ports:\n`;
      config.ports.forEach((p, pIdx) => {
        const hostPort = p.hostPort + (idx > 0 ? idx : 0);
        yaml += `      - "${hostPort}:${p.containerPort}/${p.protocol || "tcp"}"\n`;
      });
    }

    if (config.envVars && config.envVars.length > 0) {
      yaml += `    environment:\n`;
      config.envVars.forEach((e) => {
        yaml += `      - ${e.key}=${e.value}\n`;
      });
    }

    if (config.volumes && config.volumes.length > 0) {
      yaml += `    volumes:\n`;
      config.volumes.forEach((v) => {
        yaml += `      - ${v.hostPath}:${v.containerPath}:${v.mode || "rw"}\n`;
      });
    }

    if (config.network?.mode === "host") yaml += `    network_mode: host\n`;

    if (config.resources?.memoryMb) yaml += `    mem_limit: ${config.resources.memoryMb}m\n`;
    if (config.resources?.cpus) yaml += `    cpus: ${config.resources.cpus}\n`;

    if (config.restartPolicy && config.restartPolicy !== "no") yaml += `    restart: ${config.restartPolicy}\n`;
    if (config.customCommand) yaml += `    command: ${config.customCommand}\n`;

    yaml += `    labels:\n      - managed-by=infra-gateway-docker-lab\n\n`;
  });

  return yaml;
}

function generateDockerRunCommands(configs: ContainerConfig[]): string {
  return configs.map((config, idx) => {
    const image = DOCKER_IMAGES_CATALOG.find((i) => i.id === config.imageId);
    const baseName = (config.containerName || config.imageId).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const name = `dlab-${baseName}${idx > 0 ? `-${idx + 1}` : ""}`;
    const parts: string[] = ["docker run -d"];
    parts.push(`--name ${name}`);
    
    (config.ports || []).forEach((p) => {
      const hostPort = p.hostPort + (idx > 0 ? idx : 0);
      parts.push(`-p ${hostPort}:${p.containerPort}/${p.protocol || "tcp"}`);
    });
    
    (config.envVars || []).forEach((e) => parts.push(`-e ${e.key}=${e.value}`));
    (config.volumes || []).forEach((v) => parts.push(`-v ${v.hostPath}:${v.containerPath}:${v.mode || "rw"}`));
    if (config.resources?.memoryMb) parts.push(`--memory ${config.resources.memoryMb}m`);
    if (config.resources?.cpus) parts.push(`--cpus ${config.resources.cpus}`);
    if (config.restartPolicy && config.restartPolicy !== "no") parts.push(`--restart ${config.restartPolicy}`);
    parts.push(`--label managed-by=infra-gateway-docker-lab`);
    parts.push(`${image?.image || config.imageId}:${config.tag || "latest"}`);
    if (config.customCommand) parts.push(config.customCommand);
    return parts.join(" \\\n  ");
  }).join("\n\n");
}

interface ConfigPreviewModalProps {
  isOpen: boolean;
  configs: ContainerConfig[];
  onClose: () => void;
}

export const ConfigPreviewModal: React.FC<ConfigPreviewModalProps> = ({
  isOpen,
  configs,
  onClose,
}) => {
  const [format, setFormat] = useState<"compose" | "shell">("compose");
  const [copied, setCopied] = useState(false);

  if (!isOpen || configs.length === 0) return null;

  const content = format === "compose" ? generateDockerComposeYaml(configs) : generateDockerRunCommands(configs);
  const filename = format === "compose" ? "docker-compose.yml" : "docker-run-commands.sh";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl flex flex-col bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/90 text-xs">
          <div className="flex items-center gap-3 text-white font-bold">
            <FileCode className="h-4 w-4 text-blue-400" />
            <span>Infrastructure Configuration Preview ({configs.length} Service{configs.length > 1 ? "s" : ""})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormat("compose")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors border ${
                format === "compose"
                  ? "bg-blue-600/30 text-blue-300 border-blue-500/40 font-bold"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" /> docker-compose.yml
            </button>
            <button
              onClick={() => setFormat("shell")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors border ${
                format === "shell"
                  ? "bg-blue-600/30 text-blue-300 border-blue-500/40 font-bold"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" /> docker-run.sh
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy} className="text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" /> Download File
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 text-xs">
          <pre className="text-emerald-300 font-mono text-[11px] whitespace-pre-wrap p-4 bg-slate-900/80 rounded-xl border border-white/5 leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};
