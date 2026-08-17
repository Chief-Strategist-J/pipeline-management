"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Search, Play, Settings, ExternalLink, Box, Layers } from "lucide-react";
import type {
  DockerImage,
  ContainerConfig,
  RunningContainer,
} from "../../domain/entities/docker-image.entity";
import { CATEGORIES } from "../../constants/docker-lab.constants";
import { ProductionComboSelector } from "./ProductionComboSelector";

function countContainersForImage(runningContainers: RunningContainer[], imageId: string): number {
  return runningContainers.filter((c) => c.containerId.includes(imageId) || c.containerName.includes(imageId)).length;
}

interface ImageCatalogProps {
  catalog: DockerImage[];
  selectedCategory: string;
  searchQuery: string;
  runningContainers: RunningContainer[];
  executingImageId: string | null;
  onSelectCategory: (cat: string) => void;
  onSearchChange: (q: string) => void;
  onConfigure: (image: DockerImage) => void;
  onQuickExecute: (config: ContainerConfig, imageId: string) => void;
  onStackLaunched?: () => void;
  isLoading: boolean;
}

const CATEGORY_TABS = ["All", ...Object.values(CATEGORIES)];

export const ImageCatalog: React.FC<ImageCatalogProps> = ({
  catalog,
  selectedCategory,
  searchQuery,
  runningContainers,
  executingImageId,
  onSelectCategory,
  onSearchChange,
  onConfigure,
  onQuickExecute,
  onStackLaunched = () => {},
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <ProductionComboSelector onStackLaunched={onStackLaunched} />

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search 53 catalog images (e.g. Redis, Kafka, Postgres, Grafana)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {catalog.map((item) => {
          const runningCount = countContainersForImage(runningContainers, item.id);
          const isExec = executingImageId === item.id;

          return (
            <GlassCard
              key={item.id}
              className="p-4 hover:border-blue-500/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400 leading-none mt-1">
                        {item.image}:{item.defaultTag}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <Badge variant="neutral">{item.category}</Badge>
                  {runningCount > 0 && (
                    <Badge variant="success">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1 inline-block" />
                      {runningCount} Active
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onConfigure(item)}
                  className="flex-1 text-xs"
                >
                  <Settings className="h-3.5 w-3.5 mr-1 text-slate-400" /> Specs
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onQuickExecute(item.defaultConfig, item.id)}
                  isLoading={isExec}
                  className="flex-1 text-xs"
                >
                  <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Launch Node
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
