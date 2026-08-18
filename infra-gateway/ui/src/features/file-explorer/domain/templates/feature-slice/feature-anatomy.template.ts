import { createGenericTree } from "../builder/sub-package-tree.builder";

export const FEATURE_ANATOMY_TEMPLATE = createGenericTree(
  "feature-anatomy-policy",
  "Feature Vertical Slice (feature-anatomy.md)",
  "Feature Golden Rule: index (only public surface), service (pure logic), repository (data port), handler, contracts, migrations, tests",
  "universal",
  "payments-feature",
  [
    {
      id: "root-feat",
      name: "payments-feature",
      path: "payments-feature",
      type: "folder",
      children: [
        {
          id: "feat-index",
          name: "index.ts",
          path: "payments-feature/index.ts",
          type: "file",
          content: "export * from './service';\nexport * from './repository';",
        },
        {
          id: "feat-service",
          name: "service.ts",
          path: "payments-feature/service.ts",
          type: "file",
          content: "export function processPayment(amount: number) {\n  return { success: amount > 0, timestamp: Date.now() };\n}",
        },
        {
          id: "feat-repository",
          name: "repository.ts",
          path: "payments-feature/repository.ts",
          type: "file",
          content: "export function saveTransaction(id: string, amount: number) {\n  return Promise.resolve({ id, amount, status: 'saved' });\n}",
        },
      ],
    },
  ]
);
