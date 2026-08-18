import { createGenericTree } from "../builder/sub-package-tree.builder";

export const OPENVSCODE_PIPELINE_TEMPLATE = createGenericTree(
  "openvscode-pipeline-management",
  "OpenVSCode Pipeline Management (Reference Image)",
  "Exact directory structure replica matching OpenVSCode Server repository image",
  "universal",
  "pipeline-management",
  [
    {
      id: "root-pm",
      name: "pipeline-management",
      path: "pipeline-management",
      type: "folder",
      children: [
        {
          id: "readme-file",
          name: "README.md",
          path: "pipeline-management/README.md",
          type: "file",
          content: "# Pipeline Management Platform\n\nEnterprise OpenVSCode Server File Explorer and Infrastructure Control Center.",
        },
        {
          id: "docker-compose-file",
          name: "docker-compose.yaml",
          path: "pipeline-management/docker-compose.yaml",
          type: "file",
          content: `version: "3.8"\nservices:\n  infra-gateway:\n    build: ./infra-gateway/ui\n    ports:\n      - "3000:3000"\n    environment:\n      - MONGODB_URI=mongodb://localhost:27017/pipeline_management\n`,
        },
        {
          id: "infra-gw",
          name: "infra-gateway",
          path: "pipeline-management/infra-gateway",
          type: "folder",
          children: [
            {
              id: "ui-dir",
              name: "ui",
              path: "pipeline-management/infra-gateway/ui",
              type: "folder",
              children: [
                {
                  id: "pkg-json",
                  name: "package.json",
                  path: "pipeline-management/infra-gateway/ui/package.json",
                  type: "file",
                  content: `{\n  "name": "infra-gateway-ui",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build"\n  }\n}`,
                },
                {
                  id: "src-dir",
                  name: "src",
                  path: "pipeline-management/infra-gateway/ui/src",
                  type: "folder",
                  children: [
                    {
                      id: "app-dir",
                      name: "app",
                      path: "pipeline-management/infra-gateway/ui/src/app",
                      type: "folder",
                      children: [
                        {
                          id: "layout-tsx",
                          name: "layout.tsx",
                          path: "pipeline-management/infra-gateway/ui/src/app/layout.tsx",
                          type: "file",
                          content: "export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html><body>{children}</body></html>); }",
                        },
                        {
                          id: "page-tsx",
                          name: "page.tsx",
                          path: "pipeline-management/infra-gateway/ui/src/app/page.tsx",
                          type: "file",
                          content: "export default function HomePage() { return <h1>Pipeline Management Control Center</h1>; }",
                        },
                        {
                          id: "explorer-page-tsx",
                          name: "explorer-page.tsx",
                          path: "pipeline-management/infra-gateway/ui/src/app/explorer/page.tsx",
                          type: "file",
                          content: "import { OpenVSCodeWorkspace } from '@/features/file-explorer'; export default function ExplorerPage() { return <OpenVSCodeWorkspace />; }",
                        },
                      ],
                    },
                    {
                      id: "core-dir",
                      name: "core",
                      path: "pipeline-management/infra-gateway/ui/src/core",
                      type: "folder",
                      children: [
                        {
                          id: "configure-store-ts",
                          name: "configure-store.ts",
                          path: "pipeline-management/infra-gateway/ui/src/core/store/configure-store.ts",
                          type: "file",
                          content: "import { configureStore } from '@reduxjs/toolkit'; export const store = configureStore({ reducer: {} });",
                        },
                      ],
                    },
                    {
                      id: "features-dir",
                      name: "features",
                      path: "pipeline-management/infra-gateway/ui/src/features",
                      type: "folder",
                      children: [
                        {
                          id: "fe-dir",
                          name: "file-explorer",
                          path: "pipeline-management/infra-gateway/ui/src/features/file-explorer",
                          type: "folder",
                          children: [
                            {
                              id: "fe-slice-ts",
                              name: "file-explorer.slice.ts",
                              path: "pipeline-management/infra-gateway/ui/src/features/file-explorer/state/file-explorer.slice.ts",
                              type: "file",
                              content: "import { createSlice } from '@reduxjs/toolkit'; export const fileExplorerSlice = createSlice({ name: 'fileExplorer', initialState: {}, reducers: {} });",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]
);
