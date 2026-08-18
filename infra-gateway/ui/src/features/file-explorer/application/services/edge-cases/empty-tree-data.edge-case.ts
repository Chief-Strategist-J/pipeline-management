import type { TreeItem } from "../../../domain/entities/file-node.entity";
import { PROJECT_TEMPLATES_CATALOG } from "../../../domain/project-templates.catalog";

export class EmptyTreeDataEdgeCase {
  public static resolveFallbackTree(treeData?: TreeItem[], activeTemplateId?: string): TreeItem[] {
    if (Array.isArray(treeData) && treeData.length > 0) {
      return treeData;
    }

    const matched = PROJECT_TEMPLATES_CATALOG.find((t) => t.id === activeTemplateId);
    if (matched && Array.isArray(matched.tree) && matched.tree.length > 0) {
      return matched.tree;
    }

    return PROJECT_TEMPLATES_CATALOG[0]?.tree || [];
  }
}
