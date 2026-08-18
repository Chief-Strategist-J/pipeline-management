import type { FileBadgeKind } from "../domain/entities/file-node.entity";
import { BADGE_DATA_TABLE } from "../data/badge-resolution.data";

export function resolveBadgeRule(name: string, isFolderNode: boolean): FileBadgeKind {
  const lowerName = name.toLowerCase();
  const targetType = isFolderNode ? "folder" : "file";

  const sortedTable = [...BADGE_DATA_TABLE].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedTable) {
    if (rule.target !== "both" && rule.target !== targetType) continue;

    let isMatch = false;
    if (rule.matchType === "exact") isMatch = lowerName === rule.pattern;
    else if (rule.matchType === "startsWith") isMatch = lowerName.startsWith(rule.pattern);
    else if (rule.matchType === "endsWith") isMatch = lowerName.endsWith(rule.pattern);
    else if (rule.matchType === "includes") isMatch = lowerName.includes(rule.pattern);

    if (isMatch) return rule.badge;
  }

  return isFolderNode ? "folder" : "code";
}
