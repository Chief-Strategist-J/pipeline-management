export class EmptyFileContentEdgeCase {
  public static ensureContentString(content?: unknown): string {
    if (typeof content === "string") return content;
    if (content === null || content === undefined) return "";
    return String(content);
  }
}
