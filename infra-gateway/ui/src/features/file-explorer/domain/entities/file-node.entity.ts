import { resolveBadgeRule } from "../../rules/badge-resolution.rules";

export type NodeType = "file" | "folder";

export type FileBadgeKind =
  | "ts"
  | "tsx"
  | "css"
  | "json"
  | "yaml"
  | "markdown"
  | "gitignore"
  | "image"
  | "folder"
  | "src"
  | "app"
  | "api"
  | "core"
  | "features"
  | "shared"
  | "docker"
  | "nextjs"
  | "env"
  | "shell"
  | "sql"
  | "code";

export interface FileNode {
  id: string;
  name: string;
  type: "file";
  path: string;
  parentId: string | null;
  badge?: FileBadgeKind;
  content?: string;
  extension?: string;
  size?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  type: "folder";
  path: string;
  parentId: string | null;
  badge?: FileBadgeKind;
  children: TreeItem[];
  isExpanded?: boolean;
}

export type TreeItem = FileNode | FolderNode;

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  language?: "typescript" | "node" | "python" | "gateway" | "universal" | "blank" | string;
  rootFolderName: string;
  tree: TreeItem[];
}

export function isFolder(node: TreeItem): node is FolderNode {
  return node.type === "folder";
}

export function isFile(node: TreeItem): node is FileNode {
  return node.type === "file";
}

export function detectBadgeKind(name: string, isFolderNode: boolean): FileBadgeKind {
  return resolveBadgeRule(name, isFolderNode);
}
