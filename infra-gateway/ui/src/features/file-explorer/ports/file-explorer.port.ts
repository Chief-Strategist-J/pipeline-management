import type { TreeItem, ProjectTemplate } from "../domain/entities/file-node.entity";
import type { ServiceRunnerMeta } from "../data/server-runner.data";

export interface FileExplorerPort {
  getTemplates(): Promise<ProjectTemplate[]>;
  syncTree(treeData: TreeItem[]): Promise<{ success: boolean; syncedAt: string; nodeCount: number }>;
  startService(meta: ServiceRunnerMeta): Promise<{ success: boolean; message: string }>;
  stopService(port: number): Promise<{ success: boolean }>;
  sendTestRequest(url: string, meta: ServiceRunnerMeta): Promise<string>;
  saveFileNode(payload: { fileId: string; name: string; path: string; content: string }): Promise<{ success: boolean; message: string; savedAt: string }>;
}
