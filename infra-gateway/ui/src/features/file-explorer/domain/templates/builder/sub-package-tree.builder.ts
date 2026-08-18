import type { ProjectTemplate, TreeItem } from "../../entities/file-node.entity";
import { detectBadgeKind } from "../../entities/file-node.entity";

export interface SimpleNodeSpec {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  children?: SimpleNodeSpec[];
}

export function createGenericTree(
  id: string,
  name: string,
  description: string,
  language: string,
  rootFolderName: string,
  specNodes: SimpleNodeSpec[]
): ProjectTemplate {
  const buildNode = (spec: SimpleNodeSpec, parentId: string | null): TreeItem => {
    const isFolderNode = spec.type === "folder";
    const badge = detectBadgeKind(spec.name, isFolderNode);

    if (isFolderNode) {
      const folderChildren: TreeItem[] = (spec.children || []).map((child) => buildNode(child, spec.id));
      return {
        id: spec.id,
        name: spec.name,
        type: "folder",
        path: spec.path,
        parentId,
        badge,
        children: folderChildren,
        isExpanded: true,
      };
    }

    return {
      id: spec.id,
      name: spec.name,
      type: "file",
      path: spec.path,
      parentId,
      badge,
      content: spec.content || "",
    };
  };

  const tree: TreeItem[] = specNodes.map((n) => buildNode(n, null));

  return {
    id,
    name,
    description,
    language,
    rootFolderName,
    tree,
  };
}

export interface SubPackageSpec {
  id: string;
  name: string;
  description: string;
  language: string;
  rootFolderName: string;
  contracts: {
    openapi?: string;
    graphql?: string;
    proto?: string;
    asyncapi?: string;
  };
  mainApiFile: { name: string; content: string };
  featureName: string;
  featureFiles: { name: string; content: string }[];
  migrationFiles: { name: string; content: string }[];
  dockerfileContent: string;
  dockerfileDevContent: string;
  dockerComposeContent: string;
  packageMetaContent: string;
  portRegistryContent: string;
  unitTestContent: string;
  scriptRunContent: string;
}

export function createSubPackageTree(spec: SubPackageSpec): ProjectTemplate {
  const root = spec.rootFolderName;

  const createFolder = (id: string, name: string, path: string, parentId: string, children: TreeItem[] = []): TreeItem => ({
    id,
    name,
    type: "folder",
    path,
    parentId,
    badge: detectBadgeKind(name, true),
    children,
    isExpanded: true,
  });

  const createFile = (id: string, name: string, path: string, parentId: string, content: string): TreeItem => ({
    id,
    name,
    type: "file",
    path,
    parentId,
    badge: detectBadgeKind(name, false),
    content,
  });

  const rootId = `root-${spec.id}`;

  const contractChildren: TreeItem[] = [];
  if (spec.contracts.openapi) {
    contractChildren.push(
      createFolder(`${spec.id}-openapi-dir`, "openapi", `${root}/contracts/openapi`, `${spec.id}-contracts`, [
        createFile(`${spec.id}-openapi-v1`, "v1.yaml", `${root}/contracts/openapi/v1.yaml`, `${spec.id}-openapi-dir`, spec.contracts.openapi),
      ])
    );
  }
  if (spec.contracts.graphql) {
    contractChildren.push(
      createFolder(`${spec.id}-graphql-dir`, "graphql", `${root}/contracts/graphql`, `${spec.id}-contracts`, [
        createFile(`${spec.id}-graphql-schema`, "schema.graphql", `${root}/contracts/graphql/schema.graphql`, `${spec.id}-graphql-dir`, spec.contracts.graphql),
      ])
    );
  }
  if (spec.contracts.proto) {
    contractChildren.push(
      createFolder(`${spec.id}-proto-dir`, "proto", `${root}/contracts/proto`, `${spec.id}-contracts`, [
        createFile(`${spec.id}-proto-file`, "service.proto", `${root}/contracts/proto/service.proto`, `${spec.id}-proto-dir`, spec.contracts.proto),
      ])
    );
  }
  if (spec.contracts.asyncapi) {
    contractChildren.push(
      createFolder(`${spec.id}-asyncapi-dir`, "asyncapi", `${root}/contracts/asyncapi`, `${spec.id}-contracts`, [
        createFile(`${spec.id}-asyncapi-events`, "events.yaml", `${root}/contracts/asyncapi/events.yaml`, `${spec.id}-asyncapi-dir`, spec.contracts.asyncapi),
      ])
    );
  }

  const featureChildren: TreeItem[] = spec.featureFiles.map((f, i) =>
    createFile(`${spec.id}-feat-${i}`, f.name, `${root}/src/features/${spec.featureName}/${f.name}`, `${spec.id}-feat-dir`, f.content)
  );

  const migrationChildren: TreeItem[] = spec.migrationFiles.map((m, i) =>
    createFile(`${spec.id}-mig-${i}`, m.name, `${root}/database/migrations/${m.name}`, `${spec.id}-mig-dir`, m.content)
  );

  const tree: TreeItem[] = [
    createFolder(rootId, root, root, null as any, [
      createFolder(`${spec.id}-contracts`, "contracts", `${root}/contracts`, rootId, contractChildren),
      createFolder(`${spec.id}-src`, "src", `${root}/src`, rootId, [
        createFolder(`${spec.id}-api`, "api", `${root}/src/api`, `${spec.id}-src`, [
          createFile(`${spec.id}-main-api`, spec.mainApiFile.name, `${root}/src/api/${spec.mainApiFile.name}`, `${spec.id}-api`, spec.mainApiFile.content),
        ]),
        createFolder(`${spec.id}-features`, "features", `${root}/src/features`, `${spec.id}-src`, [
          createFolder(`${spec.id}-feat-dir`, spec.featureName, `${root}/src/features/${spec.featureName}`, `${spec.id}-features`, featureChildren),
        ]),
        createFolder(`${spec.id}-infra`, "infra", `${root}/src/infra`, `${spec.id}-src`, [
          createFolder(`${spec.id}-adapters`, "adapters", `${root}/src/infra/adapters`, `${spec.id}-infra`, [
            createFile(`${spec.id}-db-adapter`, "db-adapter.ts", `${root}/src/infra/adapters/db-adapter.ts`, `${spec.id}-adapters`, "export class DatabaseAdapter {}"),
          ]),
        ]),
        createFolder(`${spec.id}-shared`, "shared", `${root}/src/shared`, `${spec.id}-src`, [
          createFile(`${spec.id}-common-types`, "types.ts", `${root}/src/shared/types.ts`, `${spec.id}-shared`, "export type Result<T> = T;"),
        ]),
      ]),
      createFolder(`${spec.id}-database`, "database", `${root}/database`, rootId, [
        createFolder(`${spec.id}-mig-dir`, "migrations", `${root}/database/migrations`, `${spec.id}-database`, migrationChildren),
        createFile(`${spec.id}-schema-lock`, "schema.lock", `${root}/database/schema.lock`, `${spec.id}-database`, "version: 1"),
      ]),
      createFolder(`${spec.id}-tests`, "tests", `${root}/tests`, rootId, [
        createFolder(`${spec.id}-unit`, "unit", `${root}/tests/unit`, `${spec.id}-tests`, [
          createFile(`${spec.id}-unit-test`, "unit.test.ts", `${root}/tests/unit/unit.test.ts`, `${spec.id}-unit`, spec.unitTestContent),
        ]),
      ]),
      createFolder(`${spec.id}-scripts`, "scripts", `${root}/scripts`, rootId, [
        createFile(`${spec.id}-run-sh`, "run.sh", `${root}/scripts/run.sh`, `${spec.id}-scripts`, spec.scriptRunContent),
      ]),
      createFolder(`${spec.id}-deploy`, "deploy", `${root}/deploy`, rootId, [
        createFolder(`${spec.id}-docker-deploy`, "docker", `${root}/deploy/docker`, `${spec.id}-deploy`, [
          createFile(`${spec.id}-compose-yml`, "docker-compose.dev.yaml", `${root}/deploy/docker/docker-compose.dev.yaml`, `${spec.id}-docker-deploy`, spec.dockerComposeContent),
        ]),
      ]),
      createFolder(`${spec.id}-build`, "build", `${root}/build`, rootId, [
        createFile(`${spec.id}-dockerfile`, "Dockerfile", `${root}/build/Dockerfile`, `${spec.id}-build`, spec.dockerfileContent),
        createFile(`${spec.id}-dockerfile-dev`, "Dockerfile.dev", `${root}/build/Dockerfile.dev`, `${spec.id}-build`, spec.dockerfileDevContent),
      ]),
      createFile(`${spec.id}-meta`, ".package-meta.yaml", `${root}/.package-meta.yaml`, rootId, spec.packageMetaContent),
      createFile(`${spec.id}-ports`, ".port-registry", `${root}/.port-registry`, rootId, spec.portRegistryContent),
    ]),
  ];

  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    language: spec.language,
    rootFolderName: spec.rootFolderName,
    tree,
  };
}
