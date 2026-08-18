import { z } from "zod";
import type { EntitySchema } from "@/core/data-driven/entity-schema.types";
import type { JsonMapOp } from "@/core/data-driven/transform.types";

export const TreeItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["file", "folder"]),
    path: z.string(),
    parentId: z.string().nullable(),
    badge: z.string().optional(),
    content: z.string().optional(),
    isExpanded: z.boolean().optional(),
    children: z.array(TreeItemSchema).optional(),
  })
);

export const ProjectTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  language: z.string().optional(),
  rootFolderName: z.string(),
  tree: z.array(TreeItemSchema),
});

export const TEMPLATE_FROM_API_OPS: JsonMapOp[] = [
  { op: "default", field: "language", value: "universal" },
];

export const TEMPLATE_TO_API_OPS: JsonMapOp[] = [
  { op: "pick", fields: ["id", "name", "description", "language", "rootFolderName", "tree"] },
];

export const fileExplorerEntitySchema: EntitySchema = {
  name: "fileExplorer",
  endpoint: "/api/templates",
  fields: [
    { key: "id", label: "Template ID", kind: "text", required: true },
    { key: "name", label: "Template Name", kind: "text", required: true },
    { key: "description", label: "Description", kind: "text" },
    { key: "language", label: "Programming Language", kind: "select", options: [
      { label: "TypeScript", value: "typescript" },
      { label: "Node.js", value: "node" },
      { label: "Python", value: "python" },
      { label: "Gateway", value: "gateway" },
      { label: "Universal", value: "universal" },
    ]},
    { key: "rootFolderName", label: "Root Folder Name", kind: "text", required: true },
  ],
  validate: ProjectTemplateSchema,
  fromApi: TEMPLATE_FROM_API_OPS,
  toApi: TEMPLATE_TO_API_OPS,
};
