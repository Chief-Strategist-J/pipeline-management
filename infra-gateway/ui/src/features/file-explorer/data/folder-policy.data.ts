export interface FolderStructureRuleResult {
  ruleId: string;
  ruleName: string;
  category: "security" | "routing" | "transform" | "validation";
  passed: boolean;
  message: string;
}

export interface FolderPolicyDataConfig {
  id: string;
  name: string;
  category: "security" | "routing" | "transform" | "validation";
  priority: number;
  triggerMatch: string[];
  requiredChildren?: string[];
  requiredPrefix?: string;
  successMessage: string;
}

export const FOLDER_POLICY_DATA_TABLE: FolderPolicyDataConfig[] = [
  {
    id: "rule-feature-golden-index",
    name: "Feature Golden Rule: Public Index Export",
    category: "validation",
    priority: 100,
    triggerMatch: ["feature", "payments"],
    requiredChildren: ["index.ts", "index.js"],
    successMessage: "Feature contains index.ts public surface.",
  },
  {
    id: "rule-feature-anatomy-service",
    name: "Feature Anatomy: Pure Business Logic Service Layer",
    category: "validation",
    priority: 90,
    triggerMatch: ["feature"],
    requiredPrefix: "service",
    successMessage: "Feature includes pure service layer.",
  },
  {
    id: "rule-gateway-architecture-layers",
    name: "Gateway Policy: Tiered Layer Architecture",
    category: "security",
    priority: 95,
    triggerMatch: ["infra-gateway"],
    requiredChildren: ["edge", "routing", "auth", "observability"],
    successMessage: "Gateway conforms to Tier 1-3 edge, routing, auth, observability policies.",
  },
  {
    id: "rule-universal-subpackage-contracts",
    name: "Universal Sub-Package Rule: Contracts Defined",
    category: "validation",
    priority: 85,
    triggerMatch: ["service", "order"],
    requiredChildren: ["contracts"],
    successMessage: "Sub-package defines explicit contracts/ directory.",
  },
];
