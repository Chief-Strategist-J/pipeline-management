import type { TreeItem, FolderNode } from "../domain/entities/file-node.entity";
import {
  FOLDER_POLICY_DATA_TABLE,
  type FolderStructureRuleResult,
} from "../data/folder-policy.data";

export type { FolderStructureRuleResult };

export async function evaluateFolderStructurePolicy(tree: TreeItem[]): Promise<FolderStructureRuleResult[]> {
  const rootNode = tree[0];
  const rootName = rootNode?.name || "";
  const children = (rootNode as FolderNode)?.children || [];
  const childNames = children.map((c) => c.name);

  return FOLDER_POLICY_DATA_TABLE.map((policy) => {
    const isApplicable = policy.triggerMatch.some((key) => rootName.includes(key));
    if (!isApplicable) {
      return {
        ruleId: policy.id,
        ruleName: policy.name,
        category: policy.category,
        passed: true,
        message: policy.successMessage,
      };
    }

    let passed = true;
    if (policy.requiredChildren) {
      passed = policy.requiredChildren.some((req) => childNames.includes(req));
    }
    if (passed && policy.requiredPrefix) {
      passed = childNames.some((n) => n.startsWith(policy.requiredPrefix!));
    }

    return {
      ruleId: policy.id,
      ruleName: policy.name,
      category: policy.category,
      passed,
      message: passed ? policy.successMessage : `Policy Rule [${policy.name}] failed verification.`,
    };
  });
}
