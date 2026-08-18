import { createSubPackageTree } from "../builder/sub-package-tree.builder";

export const NODE_UNIVERSAL_PACKAGE_TEMPLATE = createSubPackageTree({
  id: "node-universal-package-architecture",
  name: "Node.js / TypeScript Universal Package (package-structure.md)",
  description: "Comprehensive 100% complete sub-package layout: contracts, src (api, features, infra, shared), database, tests, scripts, deploy, build",
  language: "node",
  rootFolderName: "order-service",
  contracts: {
    openapi: `openapi: 3.0.0\ninfo:\n  title: Order Service API\n  version: 1.0.0\npaths:\n  /orders:\n    get:\n      summary: List orders\n      responses:\n        '200':\n          description: Success`,
    graphql: `type Order {\n  id: ID!\n  totalAmount: Float!\n  status: String!\n}\n\ntype Query {\n  orders: [Order!]\n}`,
    proto: `syntax = "proto3";\npackage order.v1;\nmessage GetOrderRequest { string id = 1; }\nmessage OrderResponse { string id = 1; double total_amount = 2; }`,
    asyncapi: `asyncapi: 2.6.0\ninfo:\n  title: Order Events\n  version: 1.0.0`,
  },
  mainApiFile: {
    name: "router.ts",
    content: `import { Router } from "express";\nexport function createOrderRouter() {\n  const router = Router();\n  router.get("/", (req, res) => res.json({ orders: [] }));\n  return router;\n}`,
  },
  featureName: "order",
  featureFiles: [
    {
      name: "index.ts",
      content: `export * from "./service";\nexport * from "./repository";`,
    },
    {
      name: "service.ts",
      content: `export function calculateTotal(items: { price: number; qty: number }[]): number {\n  return items.reduce((sum, item) => sum + item.price * item.qty, 0);\n}`,
    },
    {
      name: "repository.ts",
      content: `export async function fetchOrderById(id: string) {\n  return Promise.resolve({ id, status: "completed" });\n}`,
    },
  ],
  migrationFiles: [
    {
      name: "0001_init_schema.sql",
      content: `CREATE TABLE orders (\n  id UUID PRIMARY KEY,\n  total_amount NUMERIC(10, 2) NOT NULL,\n  status VARCHAR(50) NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);`,
    },
    {
      name: "0001_init_schema.rollback.sql",
      content: `DROP TABLE IF EXISTS orders;`,
    },
  ],
  dockerfileContent: `FROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nCMD ["npm", "start"]`,
  dockerfileDevContent: `FROM node:18-alpine\nWORKDIR /app\nCMD ["npm", "run", "dev"]`,
  dockerComposeContent: `version: '3.8'\nservices:\n  order-service:\n    build:\n      context: ../..\n      dockerfile: build/Dockerfile\n    ports:\n      - "8080:8080"\n    environment:\n      NODE_ENV: development`,
  packageMetaContent: `name: order-service\nversion: 1.0.0\nlanguage: node-typescript\nstage: 2`,
  portRegistryContent: `HTTP_PORT=8080\nGRPC_PORT=9090\nMETRICS_PORT=9100`,
  unitTestContent: `import { calculateTotal } from "../../src/features/order/service";\ntest("should calculate total", () => {\n  expect(calculateTotal([{ price: 10, qty: 2 }])).toBe(20);\n});`,
  scriptRunContent: `#!/usr/bin/env bash\nexec npm run dev`,
});
