export class BinaryContentEdgeCase {
  public static encodeBase64(content?: string): string {
    const raw = typeof content === "string" ? content : "";
    return Buffer.from(raw, "utf-8").toString("base64");
  }

  public static isBinaryExtension(filename: string): boolean {
    const binExts = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".tar", ".gz"];
    const lower = filename.toLowerCase();
    return binExts.some((ext) => lower.endsWith(ext));
  }
}
