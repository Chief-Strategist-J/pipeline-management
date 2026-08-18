/**
 * ALGORITHM: TREE FLATTENING & RELATIVE PATH STRIPPING
 * ============================================================================
 * 1. RECURSIVE TRAVERSAL:
 *    - Traverses nested TreeItem hierarchy (`type: "file"` vs `type: "folder"`).
 *    - Accumulates paths as `parentPath/cleanNodeName`.
 *    - Extract file content safely from `node.content` or fallback to `""`.
 * 
 * 2. AUTOMATIC ROOT PREFIX STRIPPING:
 *    - Detects if all files share a common root container folder (e.g. `nextjs-extreme-scale/`).
 *    - Strips the root container prefix so files sit cleanly at GitHub repo root (`package.json`, `src/index.ts`).
 * 
 * 3. FALLBACK CATALOG RESOLUTION:
 *    - If workspace tree is empty, falls back to the default architecture template in PROJECT_TEMPLATES_CATALOG.
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
          const filePath = node.path ? node.path.replace(/\\/g, "/") : pathSegment;
          const nodeContent = (node as any).content;
          rawFiles.push({
            path: filePath,
            content: typeof nodeContent === "string" ? nodeContent : "",
          });
        }
      }
    }

    recurse(nodes);

    if (rawFiles.length === 0) return [];

    const firstPath = rawFiles[0].path;
    const firstSlashIdx = firstPath.indexOf("/");

    if (firstSlashIdx !== -1) {
      const candidatePrefix = firstPath.substring(0, firstSlashIdx + 1);
      const allStartWithPrefix = rawFiles.every((f) => f.path.startsWith(candidatePrefix));
      if (allStartWithPrefix) {
        return rawFiles.map((f) => ({
          path: f.path.substring(candidatePrefix.length),
          content: f.content,
        }));
      }
    }

    return rawFiles;
  }

  public static resolveTreeDataWithFallback(treeData: TreeItem[] = []): FlatFileEntry[] {
    let files = this.flattenTree(treeData);
    if (files.length === 0 && PROJECT_TEMPLATES_CATALOG.length > 0) {
      files = this.flattenTree(PROJECT_TEMPLATES_CATALOG[0].tree);
    }
    return files;
  }
}
