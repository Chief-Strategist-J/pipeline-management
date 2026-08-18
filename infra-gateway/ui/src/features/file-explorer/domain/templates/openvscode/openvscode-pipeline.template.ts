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
                      children: [],
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
