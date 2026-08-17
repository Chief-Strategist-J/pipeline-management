"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Search, Play, Settings, ExternalLink, Box, CheckSquare, Square, Layers, Download } from "lucide-react";
import type {
  DockerImage,
  ContainerConfig,
  RunningContainer
} from "../../domain/entities/docker-image.entity";

function countContainersForImage(runningContainers: RunningContainer[], imageId: string): number {
  return runningContainers.filter((c) => c.containerId.includes(imageId) || c.containerName.includes(imageId)).length;
}

interface ImageCatalogProps {
  catalog: DockerImage[];
  selectedCategory: string;
  searchQuery: string;
  runningContainers: RunningContainer[];
  selectedImageIds: string[];
  executingImageId: string | null;
  onSelectCategory: (cat: string) => void;
  onSearchChange: (q: string) => void;
  onToggleSelectImage: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onConfigure: (image: DockerImage) => void;
  onQuickExecute: (config: ContainerConfig, imageId: string) => void;
  onExecuteSelected: () => void;
  onPreviewSelectedConfig: () => void;
  isLoading: boolean;
}

const CATEGORIES = [
  "All",
  "Databases",
  "Messaging",
  "Observability",
  "Search",
  "Proxy & Gateway",
  "Security & Auth",
  "CI/CD & Infra",
];

export const ImageCatalog: React.FC<ImageCatalogProps> = ({
  catalog,
  selectedCategory,
  searchQuery,
  runningContainers,
  selectedImageIds,
  executingImageId,
  onSelectCategory,
  onSearchChange,
  onToggleSelectImage,
  onSelectAll,
  onClearSelection,
  onConfigure,
  onQuickExecute,
  onExecuteSelected,
  onPreviewSelectedConfig,
  isLoading,
}) => {
  const isAllSelected = catalog.length > 0 && catalog.every((item) => selectedImageIds.includes(item.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search 47+ Docker images (e.g. Redis, Kafka, Postgres, Grafana)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                    : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-400" />
            ) : (
              <Square className="h-4 w-4 text-slate-500" />
            )}
            <span className="font-semibold">Select All ({catalog.length})</span>
          </button>
          {selectedImageIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {selectedImageIds.length} Selected
            </span>
          )}
        </div>

        {selectedImageIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreviewSelectedConfig}
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-indigo-400" /> Preview & Download ({selectedImageIds.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onExecuteSelected}
              isLoading={isLoading}
              className="text-xs"
            >
              <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Execute Selected ({selectedImageIds.length})
            </Button>
            <button
              onClick={onClearSelection}
              className="text-slate-500 hover:text-slate-300 text-[11px] px-2 py-1"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Check items to multi-select and configure/execute in batch
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {catalog.map((item) => {
          const runningCount = countContainersForImage(runningContainers, item.id);
          const isRunning = runningCount > 0;
          const isSelected = selectedImageIds.includes(item.id);
          const isExecutingThis = executingImageId === item.id;

          return (
            <GlassCard
              key={item.id}
              className={`flex flex-col justify-between p-5 space-y-4 transition-all relative group cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10"
                  : "hover:border-blue-500/40"
              }`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
                onToggleSelectImage(item.id);
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectImage(item.id);
                      }}
                      className="text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                    <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-white/10 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug">{item.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500">{item.image}:{item.defaultTag}</p>
                    </div>
                  </div>

                  {isRunning && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-pulse shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {runningCount} Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-3 border-t border-white/5 pt-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between text-[11px]">
                  <Badge variant="neutral">{item.category}</Badge>
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    Hub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onConfigure(item)}
                    disabled={isLoading}
                    className="w-full text-[11px]"
                  >
                    <Settings className="h-3.5 w-3.5 mr-1 text-slate-400" /> Configure
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onQuickExecute(item.defaultConfig, item.id)}
                    isLoading={isExecutingThis}
                    disabled={isLoading && !isExecutingThis}
                    className="w-full text-[11px]"
                  >
                    <Play className="h-3 w-3 mr-1 fill-current" /> Execute
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {catalog.length === 0 && (
        <GlassCard className="p-12 text-center text-slate-500 space-y-2">
          <Box className="h-10 w-10 mx-auto text-slate-700" />
          <p className="text-sm">No Docker images matching your search or category filter.</p>
        </GlassCard>
      )}
    </div>
  );
};
