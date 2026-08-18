import type { FlatFileEntry } from "../tree-flattening.service";

export class MaxPayloadSizeEdgeCase {
  public static readonly MAX_SINGLE_COMMIT_BYTES = 50 * 1024 * 1024; // 50MB

  public static isPayloadExceeded(files: FlatFileEntry[]): boolean {
    const totalBytes = files.reduce((acc, f) => acc + (f.content ? f.content.length : 0), 0);
    return totalBytes > this.MAX_SINGLE_COMMIT_BYTES;
  }
}
