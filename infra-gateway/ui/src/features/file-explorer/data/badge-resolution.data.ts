import type { FileBadgeKind } from "../domain/entities/file-node.entity";

export interface BadgeDataRule {
  target: "folder" | "file" | "both";
  matchType: "exact" | "startsWith" | "endsWith" | "includes";
  pattern: string;
  badge: FileBadgeKind;
  priority: number;
}

export const BADGE_DATA_TABLE: BadgeDataRule[] = [
  { target: "folder", matchType: "exact", pattern: "src", badge: "src", priority: 100 },
  { target: "folder", matchType: "exact", pattern: "app", badge: "app", priority: 100 },
  { target: "folder", matchType: "exact", pattern: "api", badge: "api", priority: 100 },
  { target: "folder", matchType: "exact", pattern: "core", badge: "core", priority: 100 },
  { target: "folder", matchType: "exact", pattern: "features", badge: "features", priority: 100 },
  { target: "folder", matchType: "exact", pattern: "shared", badge: "shared", priority: 100 },
  { target: "folder", matchType: "includes", pattern: "docker", badge: "docker", priority: 90 },

  { target: "file", matchType: "includes", pattern: "docker", badge: "docker", priority: 95 },
  { target: "file", matchType: "includes", pattern: "next.config", badge: "nextjs", priority: 95 },
  { target: "file", matchType: "startsWith", pattern: ".env", badge: "env", priority: 90 },
  { target: "file", matchType: "endsWith", pattern: ".sh", badge: "shell", priority: 90 },
  { target: "file", matchType: "endsWith", pattern: ".bash", badge: "shell", priority: 90 },
  { target: "file", matchType: "endsWith", pattern: ".sql", badge: "sql", priority: 90 },
  { target: "file", matchType: "endsWith", pattern: ".tsx", badge: "tsx", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".ts", badge: "ts", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".css", badge: "css", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".json", badge: "json", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".yaml", badge: "yaml", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".yml", badge: "yaml", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".md", badge: "markdown", priority: 80 },
  { target: "file", matchType: "exact", pattern: ".gitignore", badge: "gitignore", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".ico", badge: "image", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".png", badge: "image", priority: 80 },
  { target: "file", matchType: "endsWith", pattern: ".jpg", badge: "image", priority: 80 },
];
