import type { TreeItem } from "../domain/entities/file-node.entity";

export function generateSetupShellScript(nodes: TreeItem[], rootName = "project"): string {
  let lines: string[] = [
    "#!/usr/bin/env bash",
    "set -e",
    "",
    `echo "🚀 Generating folder structure for ${rootName}..."`,
    "",
  ];

  function processNode(node: TreeItem) {
    if (node.type === "folder") {
      lines.push(`mkdir -p "${node.path}"`);
      for (const child of node.children) {
        processNode(child);
      }
    } else if (node.type === "file") {
      const parentDir = node.path.substring(0, node.path.lastIndexOf("/"));
      if (parentDir) {
        lines.push(`mkdir -p "${parentDir}"`);
      }
      const rawContent = node.content || "";
      const safeContent = rawContent.replace(/EOF/g, "E_O_F");
      lines.push(`cat << 'EOF' > "${node.path}"`);
      lines.push(safeContent);
      lines.push("EOF");
      lines.push("");
    }
  }

  for (const root of nodes) {
    processNode(root);
  }

  lines.push(`echo "✅ Folder structure created successfully!"`);
  return lines.join("\n");
}

export function triggerFileDownload(filename: string, content: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadWorkspaceZip(nodes: TreeItem[], rootName = "project") {
  const scriptContent = generateSetupShellScript(nodes, rootName);
  triggerFileDownload(`setup-${rootName.toLowerCase().replace(/\s+/g, "-")}.sh`, scriptContent, "application/x-sh");
}
