import { createGenericTree } from "../builder/sub-package-tree.builder";

export const API_FIRST_TEMPLATE = createGenericTree(
  "api-first-policy",
  "API-First Architecture (api-structure.md)",
  "Contracts first before source: shared/contracts/ (openapi, graphql, asyncapi), ports/, src/api/ (rest, graphql, events)",
  "universal",
  "api-platform",
  [
    {
      id: "root-api-platform",
      name: "api-platform",
      path: "api-platform",
      type: "folder",
      children: [
        {
          id: "api-shared",
          name: "shared",
          path: "api-platform/shared",
          type: "folder",
          children: [
            {
              id: "api-contracts",
              name: "contracts",
              path: "api-platform/shared/contracts",
              type: "folder",
              children: [
                {
                  id: "api-contracts-openapi",
                  name: "openapi",
                  path: "api-platform/shared/contracts/openapi",
                  type: "folder",
                  children: [
                    {
                      id: "api-openapi-v1",
                      name: "v1.yaml",
                      path: "api-platform/shared/contracts/openapi/v1.yaml",
                      type: "file",
                      content: "openapi: 3.0.0\ninfo:\n  title: Core API\n  version: 1.0.0",
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
