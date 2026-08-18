import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileImage,
  Flame,
  Atom,
  Layers,
  Server,
  Box,
  Share2,
  Workflow,
  Cpu,
  Lock,
  Terminal,
  Database,
} from "lucide-react";

export interface IconDataConfig {
  openIcon?: any;
  closedIcon?: any;
  lucideIcon?: any;
  color?: string;
  badgeTag?: {
    bg: string;
    text: string;
    border?: string;
    label?: string;
    lucide?: any;
  };
}

export const ICON_DATA_REGISTRY: Record<string, IconDataConfig> = {
  src: { openIcon: FolderOpen, closedIcon: Folder, color: "text-amber-400" },
  app: { openIcon: FolderOpen, closedIcon: Folder, color: "text-rose-400" },
  api: { openIcon: FolderOpen, closedIcon: Server, color: "text-emerald-400" },
  core: { openIcon: Cpu, closedIcon: Cpu, color: "text-blue-400" },
  features: { openIcon: Box, closedIcon: Box, color: "text-violet-400" },
  shared: { openIcon: Share2, closedIcon: Share2, color: "text-purple-400" },
  docker: {
    openIcon: Workflow,
    closedIcon: Workflow,
    color: "text-cyan-400",
    badgeTag: { bg: "bg-[#0db7ed]/20", text: "text-[#0db7ed]", border: "border-[#0db7ed]/40", lucide: Workflow },
  },
  nextjs: {
    badgeTag: { bg: "bg-black", text: "text-white font-extrabold text-[10px]", border: "border-white/20", label: "N" },
  },
  ts: {
    badgeTag: { bg: "bg-[#3178c6]", text: "text-white font-black text-[9px]", label: "TS" },
  },
  tsx: {
    badgeTag: { bg: "bg-[#23272f]", text: "text-[#149eca]", border: "border-[#149eca]/40", lucide: Atom },
  },
  css: {
    badgeTag: { bg: "bg-transparent", text: "text-[#42a5f5] font-bold text-[10px]", label: "{}" },
  },
  markdown: {
    badgeTag: { bg: "bg-slate-800", text: "text-blue-400 font-extrabold text-[9px]", border: "border-blue-500/30", label: "M↓" },
  },
  json: { lucideIcon: FileJson, color: "text-amber-300" },
  yaml: { lucideIcon: Layers, color: "text-rose-400" },
  env: { lucideIcon: Lock, color: "text-emerald-400" },
  shell: { lucideIcon: Terminal, color: "text-emerald-300" },
  sql: { lucideIcon: Database, color: "text-indigo-400" },
  gitignore: { lucideIcon: Flame, color: "text-orange-500" },
  image: { lucideIcon: FileImage, color: "text-purple-400" },
  folder: { openIcon: FolderOpen, closedIcon: Folder, color: "text-blue-400" },
  default: { lucideIcon: FileCode, color: "text-slate-400" },
};
