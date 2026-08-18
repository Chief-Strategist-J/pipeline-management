import type { FlatFileEntry } from "../tree-flattening.service";

export class DuplicateFilePathsEdgeCase {
  public static deduplicate(entries: FlatFileEntry[]): FlatFileEntry[] {
    const fileMap = new Map<string, string>();
    for (const entry of entries) {
      if (entry.path) {
        fileMap.set(entry.path, entry.content);
      }
    }
    return Array.from(fileMap.entries()).map(([path, content]) => ({ path, content }));
  }
}
