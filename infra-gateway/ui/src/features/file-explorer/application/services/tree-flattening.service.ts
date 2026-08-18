/**
 * ALGORITHM: TREE FLATTENING & RELATIVE PATH STRIPPING
 * ============================================================================
 * 1. RECURSIVE TRAVERSAL & PATH CLEANING:
 *    - Traverses nested TreeItem hierarchy (`type: "file"` vs `type: "folder"`).
 *    - Normalizes slashes and strips leading/trailing slashes.
 *    - Safely converts `content` to string (fallback to `""`).
 * 
 * 2. DEDUPLICATION BY RELATIVE PATH:
 *    - Filters out duplicate path entries keeping the last updated version.
 * 
 * 3. AUTOMATIC ROOT PREFIX STRIPPING:
 *    - Detects if all files share a common root container folder (e.g. `nextjs-extreme-scale/`).
 *    - Strips the root container prefix so files sit cleanly at GitHub repo root (`package.json`, `src/index.ts`).
 * 
 * 4. ACTIVE TEMPLATE CATALOG RESOLUTION EDGE CASE:
 *    - If workspace tree is empty, matches `activeTemplateId` from `PROJECT_TEMPLATES_CATALOG`.
 * ============================================================================
 */

import type { TreeItem } from "../../domain/entities/file-node.entity";
import { PROJECT_TEMPLATES_CATALOG } from "../../domain/project-templates.catalog";

export interface FlatFileEntry {
  path: string;
  content: string;
}

export class TreeFlatteningService {
  public static flattenTree(nodes: TreeItem[] = []): FlatFileEntry[] {
    let rawFiles: FlatFileEntry[] = [];

    function recurse(items: TreeItem[], currentPath = "") {
      if (!Array.isArray(items)) return;

      for (const node of items) {
        if (!node) continue;
        const cleanName = (node.name || "").replace(/\\/g, "/");
        const pathSegment = currentPath ? `${currentPath}/${cleanName}` : cleanName;

        const hasChildren = "children" in node && Array.isArray((node as any).children) && (node as any).children.length > 0;
        const isFolder = node.type === "folder" || hasChildren;

        if (isFolder && hasChildren) {
          recurse((node as any).children, pathSegment);
        } else if (node.type === "file" || !hasChildren) {
          const rawPath = node.path ? node.path.replace(/\\/g, "/") : pathSegment;
          const cleanFilePath = rawPath.replace(/^\/+/, "");
          const nodeContent = (node as any).content;

          rawFiles.push({
            path: cleanFilePath,
            content: typeof nodeContent === "string" ? nodeContent : "",
          });
        }
      }
    }

    recurse(nodes);

    if (rawFiles.length === 0) return [];

    const fileMap = new Map<string, string>();
    for (const f of rawFiles) {
      if (f.path) {
        fileMap.set(f.path, f.content);
      }
    }

    let uniqueFiles: FlatFileEntry[] = Array.from(fileMap.entries()).map(([path, content]) => ({ path, content }));

    const firstPath = uniqueFiles[0].path;
    const firstSlashIdx = firstPath.indexOf("/");

    if (firstSlashIdx !== -1) {
      const candidatePrefix = firstPath.substring(0, firstSlashIdx + 1);
      const allStartWithPrefix = uniqueFiles.every((f) => f.path.startsWith(candidatePrefix));
      if (allStartWithPrefix) {
        return uniqueFiles.map((f) => ({
          path: f.path.substring(candidatePrefix.length),
          content: f.content,
        }));
      }
    }

    return uniqueFiles;
  }

  public static resolveTreeDataWithFallback(treeData: TreeItem[] = [], activeTemplateId?: string): FlatFileEntry[] {
    let files = this.flattenTree(treeData);
    if (files.length === 0 && PROJECT_TEMPLATES_CATALOG.length > 0) {
      const matchedTemplate = PROJECT_TEMPLATES_CATALOG.find((t) => t.id === activeTemplateId) || PROJECT_TEMPLATES_CATALOG[0];
      files = this.flattenTree(matchedTemplate.tree);
    }
    return files;
  }
}
