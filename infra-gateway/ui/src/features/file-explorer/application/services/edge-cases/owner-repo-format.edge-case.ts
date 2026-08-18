export class OwnerRepoFormatEdgeCase {
  public static parse(inputRepoName: string, defaultUser: string): { owner: string; actualRepo: string } {
    const trimmed = (inputRepoName || "").trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      const owner = parts[0].trim() || defaultUser;
      const actualRepo = parts.slice(1).join("/").trim();
      return { owner, actualRepo };
    }
    return { owner: defaultUser, actualRepo: trimmed };
  }
}
