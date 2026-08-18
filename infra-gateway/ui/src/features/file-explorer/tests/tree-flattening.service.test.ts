import { describe, it, expect } from "vitest";
import { TreeFlatteningService } from "../application/services/tree-flattening.service";
import type { TreeItem } from "../domain/entities/file-node.entity";
import { NEXTJS_EXTREME_SCALE_TEMPLATE } from "../domain/project-templates.catalog";

describe("TreeFlatteningService", () => {
  it("should return empty array when nodes are empty", () => {
    const flattened = TreeFlatteningService.flattenTree([]);
    expect(flattened).toEqual([]);
  });

  it("should flatten nested tree items correctly", () => {
    const sampleTree: TreeItem[] = [
      {
        id: "root-dir",
        name: "my-app",
        type: "folder",
        path: "my-app",
        parentId: null,
        children: [
          {
            id: "pkg-file",
            name: "package.json",
            type: "file",
            path: "my-app/package.json",
            parentId: "root-dir",
            content: '{"name": "my-app"}',
          },
          {
            id: "src-dir",
            name: "src",
            type: "folder",
            path: "my-app/src",
            parentId: "root-dir",
            children: [
              {
                id: "index-file",
                name: "index.ts",
                type: "file",
                path: "my-app/src/index.ts",
                parentId: "src-dir",
                content: "console.log('hello');",
              },
            ],
          },
        ],
      },
    ];

    const flattened = TreeFlatteningService.flattenTree(sampleTree);
    expect(flattened.length).toBe(2);

    expect(flattened[0]).toEqual({
      path: "package.json",
      content: '{"name": "my-app"}',
    });
    expect(flattened[1]).toEqual({
      path: "src/index.ts",
      content: "console.log('hello');",
    });
  });

  it("should fallback to catalog template when treeData is empty", () => {
    const resolved = TreeFlatteningService.resolveTreeDataWithFallback([]);
    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.some((f) => f.path.includes("page.tsx") || f.path.includes("package.json") || f.path.includes("store"))).toBe(true);
  });

  it("should correctly flatten NEXTJS_EXTREME_SCALE_TEMPLATE", () => {
    const flattened = TreeFlatteningService.flattenTree(NEXTJS_EXTREME_SCALE_TEMPLATE.tree);
    expect(flattened.length).toBeGreaterThan(5);
    expect(flattened.every((f) => !f.path.startsWith("nextjs-extreme-scale/"))).toBe(true);
  });
});
