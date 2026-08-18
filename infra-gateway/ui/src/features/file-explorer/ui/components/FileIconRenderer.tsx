import React from "react";
import { Folder, FolderOpen, FileCode } from "lucide-react";
import type { FileBadgeKind } from "../../domain/entities/file-node.entity";
import { ICON_DATA_REGISTRY } from "../../data/icon-registry.data";

interface FileIconRendererProps {
  badge?: FileBadgeKind;
  isFolder?: boolean;
  isOpen?: boolean;
  className?: string;
}

export const FileIconRenderer: React.FC<FileIconRendererProps> = ({
  badge = "folder",
  isFolder = false,
  isOpen = false,
  className = "h-4 w-4 shrink-0",
}) => {
  const config = ICON_DATA_REGISTRY[badge] || ICON_DATA_REGISTRY[isFolder ? "folder" : "default"];

  if (isFolder) {
    const FolderIcon = isOpen ? (config.openIcon || FolderOpen) : (config.closedIcon || Folder);
    return <FolderIcon className={`${className} ${config.color || "text-blue-400"}`} />;
  }

  if (config.badgeTag) {
    const tag = config.badgeTag;
    const Lucide = tag.lucide;
    return (
      <span className={`inline-flex items-center justify-center h-4 w-4 rounded-[2px] ${tag.bg} ${tag.text} ${tag.border || ""} shrink-0 select-none`}>
        {Lucide ? <Lucide className="h-3 w-3 text-current" /> : tag.label}
      </span>
    );
  }

  const IconComponent = config.lucideIcon || FileCode;
  return <IconComponent className={`${className} ${config.color || "text-slate-400"}`} />;
};
