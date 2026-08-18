import type { FlatFileEntry } from "../tree-flattening.service";

export class CandidatePrefixStrippingEdgeCase {
  public static stripSharedRootPrefix(files: FlatFileEntry[]): FlatFileEntry[] {
    if (!files || files.length === 0) return [];

    const firstPath = files[0].path;
    const firstSlashIdx = firstPath.indexOf("/");

    if (firstSlashIdx !== -1) {
      const candidatePrefix = firstPath.substring(0, firstSlashIdx + 1);
      const allStartWithPrefix = files.every((f) => f.path.startsWith(candidatePrefix));
      if (allStartWithPrefix) {
        return files.map((f) => ({
          path: f.path.substring(candidatePrefix.length),
          content: f.content,
        }));
      }
    }

    return files;
  }
}
