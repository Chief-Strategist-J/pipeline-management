import { createGenericTree } from "../builder/sub-package-tree.builder";

export const NEXTJS_EXTREME_SCALE_TEMPLATE = createGenericTree(
  "nextjs-extreme-scale-architecture",
  "Next.js 15 Extreme-Scale Architecture (nextjs-frontend-architecture.md)",
  "Strict Monorepo Layout: apps/web, packages/core, packages/shared, packages/features, packages/config",
  "typescript",
  "my-app",
  [
    {
      id: "root-nextjs-ext",
      name: "my-app",
      path: "my-app",
      type: "folder",
      children: [
        {
          id: "ext-apps",
          name: "apps",
          path: "my-app/apps",
          type: "folder",
          children: [
            {
              id: "ext-apps-web",
              name: "web",
              path: "my-app/apps/web",
              type: "folder",
              children: [
                {
                  id: "ext-web-app",
                  name: "app",
                  path: "my-app/apps/web/app",
                  type: "folder",
                  children: [
                    {
                      id: "ext-app-public",
                      name: "(public)",
                      path: "my-app/apps/web/app/(public)",
                      type: "folder",
                      children: [
                        {
                          id: "ext-app-login",
                          name: "login",
                          path: "my-app/apps/web/app/(public)/login",
                          type: "folder",
                          children: [
                            {
                              id: "ext-login-page",
                              name: "page.tsx",
                              path: "my-app/apps/web/app/(public)/login/page.tsx",
                              type: "file",
                              content: `export default function LoginPage() {\n  return <div>Login</div>;\n}`,
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: "ext-app-protected",
                      name: "(protected)",
                      path: "my-app/apps/web/app/(protected)",
                      type: "folder",
                      children: [
                        {
                          id: "ext-app-wallet",
                          name: "wallet",
                          path: "my-app/apps/web/app/(protected)/wallet",
                          type: "folder",
                          children: [
                            {
                              id: "ext-wallet-page",
                              name: "page.tsx",
                              path: "my-app/apps/web/app/(protected)/wallet/page.tsx",
                              type: "file",
                              content: `import { WalletFlow } from "@packages/features/wallet";\n\nexport default function WalletPage() {\n  return <WalletFlow />;\n}`,
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: "ext-layout-tsx",
                      name: "layout.tsx",
                      path: "my-app/apps/web/app/layout.tsx",
                      type: "file",
                      content: `import { Providers } from "./providers";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body><Providers>{children}</Providers></body>\n    </html>\n  );\n}`,
                    },
                    {
                      id: "ext-providers-tsx",
                      name: "providers.tsx",
                      path: "my-app/apps/web/app/providers.tsx",
                      type: "file",
                      content: `"use client";\nimport { Provider } from "react-redux";\nimport { store } from "@packages/core/store/configure-store";\n\nexport function Providers({ children }: { children: React.ReactNode }) {\n  return <Provider store={store}>{children}</Provider>;\n}`,
                    },
                    {
                      id: "ext-middleware-ts",
                      name: "middleware.ts",
                      path: "my-app/apps/web/app/middleware.ts",
                      type: "file",
                      content: `import { NextResponse } from "next/server";\nexport function middleware() { return NextResponse.next(); }`,
                    },
                  ],
                },
                {
                  id: "ext-next-cfg",
                  name: "next.config.ts",
                  path: "my-app/apps/web/next.config.ts",
                  type: "file",
                  content: `import type { NextConfig } from "next";\nconst config: NextConfig = { reactStrictMode: true };\nexport default config;`,
                },
              ],
            },
          ],
        },
        {
          id: "ext-packages",
          name: "packages",
          path: "my-app/packages",
          type: "folder",
          children: [
            {
              id: "ext-pkg-core",
              name: "core",
              path: "my-app/packages/core",
              type: "folder",
              children: [
                {
                  id: "ext-core-store",
                  name: "store",
                  path: "my-app/packages/core/store",
                  type: "folder",
                  children: [
                    {
                      id: "ext-feat-registry-ts",
                      name: "feature-registry.ts",
                      path: "my-app/packages/core/store/feature-registry.ts",
                      type: "file",
                      content: `interface FeatureModule { reducer: any; saga: () => Generator }\nconst registry = new Map<string, FeatureModule>();\nexport const featureRegistry = {\n  register(name: string, mod: FeatureModule) { registry.set(name, mod); },\n  getAll() { return [...registry.entries()]; },\n};`,
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
