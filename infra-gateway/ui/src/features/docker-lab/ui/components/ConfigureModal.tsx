"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { X, Play, Plus, Trash2, Sliders, HardDrive, Network, Cpu, Layers } from "lucide-react";
import type {
  DockerImage,
  ContainerConfig,
  PortMapping,
  EnvVar,
  VolumeMount
} from "../../domain/entities/docker-image.entity";

function formatPortSummary(ports: PortMapping[]): string {
  return ports.map((p) => `${p.hostPort}:${p.containerPort}/${p.protocol}`).join(", ");
}

interface ConfigureModalProps {
  isOpen: boolean;
  image: DockerImage | null;
  config: ContainerConfig | null;
  onClose: () => void;
  onExecute: (config: ContainerConfig) => void;
  isLoading: boolean;
}

export const ConfigureModal: React.FC<ConfigureModalProps> = ({
  isOpen,
  image,
  config,
  onClose,
  onExecute,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "ports" | "env" | "volumes" | "network" | "resources">("general");
  const [localConfig, setLocalConfig] = useState<ContainerConfig | null>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen || !image || !localConfig) return null;

  const handleAddPort = () => {
    const defaultP: PortMapping = { hostPort: 8000 + localConfig.ports.length, containerPort: 8000, protocol: "tcp" };
    setLocalConfig({ ...localConfig, ports: [...localConfig.ports, defaultP] });
  };

  const handleRemovePort = (index: number) => {
    setLocalConfig({ ...localConfig, ports: localConfig.ports.filter((_, i) => i !== index) });
  };

  const handleAddEnv = () => {
    setLocalConfig({ ...localConfig, envVars: [...localConfig.envVars, { key: "KEY", value: "VAL" }] });
  };

  const handleRemoveEnv = (index: number) => {
    setLocalConfig({ ...localConfig, envVars: localConfig.envVars.filter((_, i) => i !== index) });
  };

  const handleAddVolume = () => {
    const defV: VolumeMount = { hostPath: `/tmp/data-${localConfig.volumes.length}`, containerPath: "/app/data", mode: "rw" };
    setLocalConfig({ ...localConfig, volumes: [...localConfig.volumes, defV] });
  };

  const handleRemoveVolume = (index: number) => {
    setLocalConfig({ ...localConfig, volumes: localConfig.volumes.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{image.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{image.name} Configuration</h2>
                <Badge variant="info">{image.category}</Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{image.image}:{localConfig.tag}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-white/10 bg-slate-950/30 px-6 overflow-x-auto">
          {[
            { id: "general", label: "General & Replicas", icon: Sliders },
            { id: "ports", label: `Ports (${localConfig.ports.length})`, icon: Network },
            { id: "env", label: `Env Vars (${localConfig.envVars.length})`, icon: Layers },
            { id: "volumes", label: `Volumes (${localConfig.volumes.length})`, icon: HardDrive },
            { id: "network", label: "Network & Host", icon: Network },
            { id: "resources", label: "CPU & Memory", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Image Tag</label>
                  <input
                    type="text"
                    value={localConfig.tag}
                    onChange={(e) => setLocalConfig({ ...localConfig, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Container Name</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${image.id}-instance-1`}
                    value={localConfig.containerName || ""}
                    onChange={(e) => setLocalConfig({ ...localConfig, containerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-400" />
                      Container Replicas Count: <span className="text-blue-400 text-sm font-mono">{localConfig.replicas}</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Provisions multiple isolated container instances with automatic host port incrementation.
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={localConfig.replicas}
                    onChange={(e) => setLocalConfig({ ...localConfig, replicas: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })}
                    className="w-20 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-sm font-mono text-center font-bold text-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Restart Policy</label>
                <select
                  value={localConfig.restartPolicy}
                  onChange={(e) => setLocalConfig({ ...localConfig, restartPolicy: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="no">No restart (no)</option>
                  <option value="always">Always restart (always)</option>
                  <option value="on-failure">On failure only (on-failure)</option>
                  <option value="unless-stopped">Unless explicitly stopped (unless-stopped)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Entrypoint Command Override</label>
                <input
                  type="text"
                  placeholder="e.g. redis-server --appendonly yes"
                  value={localConfig.customCommand || ""}
                  onChange={(e) => setLocalConfig({ ...localConfig, customCommand: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "ports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Expose container ports to the local host machine.</p>
                <Button variant="secondary" size="sm" onClick={handleAddPort}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Port
                </Button>
              </div>

              {localConfig.ports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
                  No ports configured. Click "Add Port" to add host to container mappings.
                </div>
              ) : (
                <div className="space-y-2">
                  {localConfig.ports.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Host Port</span>
                          <input
                            type="number"
                            value={p.hostPort}
                            onChange={(e) => {
                              const nextP = [...localConfig.ports];
                              nextP[i].hostPort = parseInt(e.target.value) || 0;
                              setLocalConfig({ ...localConfig, ports: nextP });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Container Port</span>
                          <input
                            type="number"
                            value={p.containerPort}
                            onChange={(e) => {
                              const nextP = [...localConfig.ports];
                              nextP[i].containerPort = parseInt(e.target.value) || 0;
                              setLocalConfig({ ...localConfig, ports: nextP });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Protocol</span>
                          <select
                            value={p.protocol}
                            onChange={(e) => {
                              const nextP = [...localConfig.ports];
                              nextP[i].protocol = e.target.value as any;
                              setLocalConfig({ ...localConfig, ports: nextP });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                          >
                            <option value="tcp">TCP</option>
                            <option value="udp">UDP</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={() => handleRemovePort(i)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "env" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Environment key-value parameters passed to container runtime.</p>
                <Button variant="secondary" size="sm" onClick={handleAddEnv}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Env Var
                </Button>
              </div>

              {localConfig.envVars.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
                  No environment variables specified.
                </div>
              ) : (
                <div className="space-y-2">
                  {localConfig.envVars.map((env, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="KEY"
                          value={env.key}
                          onChange={(e) => {
                            const nextE = [...localConfig.envVars];
                            nextE[i].key = e.target.value;
                            setLocalConfig({ ...localConfig, envVars: nextE });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-indigo-300"
                        />
                        <input
                          type="text"
                          placeholder="VALUE"
                          value={env.value}
                          onChange={(e) => {
                            const nextE = [...localConfig.envVars];
                            nextE[i].value = e.target.value;
                            setLocalConfig({ ...localConfig, envVars: nextE });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-emerald-300"
                        />
                      </div>
                      <button onClick={() => handleRemoveEnv(i)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "volumes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Bind mount directory storage from host machine into container path.</p>
                <Button variant="secondary" size="sm" onClick={handleAddVolume}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Volume
                </Button>
              </div>

              {localConfig.volumes.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Host Path</span>
                      <input
                        type="text"
                        value={v.hostPath}
                        onChange={(e) => {
                          const nextV = [...localConfig.volumes];
                          nextV[i].hostPath = e.target.value;
                          setLocalConfig({ ...localConfig, volumes: nextV });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Container Path</span>
                      <input
                        type="text"
                        value={v.containerPath}
                        onChange={(e) => {
                          const nextV = [...localConfig.volumes];
                          nextV[i].containerPath = e.target.value;
                          setLocalConfig({ ...localConfig, volumes: nextV });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Access Mode</span>
                      <select
                        value={v.mode}
                        onChange={(e) => {
                          const nextV = [...localConfig.volumes];
                          nextV[i].mode = e.target.value as any;
                          setLocalConfig({ ...localConfig, volumes: nextV });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-white"
                      >
                        <option value="rw">Read-Write (rw)</option>
                        <option value="ro">Read-Only (ro)</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveVolume(i)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "network" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Network Mode</label>
                <select
                  value={localConfig.network.mode}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      network: { ...localConfig.network, mode: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="bridge">Bridge Network (Isolated standard network)</option>
                  <option value="host">Host Network (Direct host network interface binding)</option>
                  <option value="none">None (Disabled networking)</option>
                  <option value="custom">Custom Network Name</option>
                </select>
              </div>

              {localConfig.network.mode === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Docker Network Name</label>
                  <input
                    type="text"
                    placeholder="e.g. gateway-isolated-net"
                    value={localConfig.network.customNetworkName || ""}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        network: { ...localConfig.network, customNetworkName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CPU Cores Limit</label>
                  <input
                    type="text"
                    value={localConfig.resources.cpus}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        resources: { ...localConfig.resources, cpus: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={localConfig.resources.memoryMb}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        resources: { ...localConfig.resources, memoryMb: parseInt(e.target.value) || 512 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-mono">
            Summary: {localConfig.replicas} replica(s) &bull; Ports: {formatPortSummary(localConfig.ports) || "None"}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => onExecute(localConfig)} isLoading={isLoading}>
              <Play className="h-4 w-4 mr-1.5 fill-current" /> Execute & Deploy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
