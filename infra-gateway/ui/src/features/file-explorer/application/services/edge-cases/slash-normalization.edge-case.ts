export class SlashNormalizationEdgeCase {
  public static normalizePath(rawPath: string): string {
    if (!rawPath) return "";
    return rawPath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .replace(/\/+/g, "/");
  }
}
