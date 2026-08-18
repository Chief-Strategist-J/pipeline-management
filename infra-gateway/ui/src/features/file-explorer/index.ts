import { fileExplorerSlice } from "./state/file-explorer.slice";
import { createManageFileExplorerSaga } from "./application/sagas/manage-file-explorer.saga";
import { FileExplorerRestAdapter } from "./adapters/rest/file-explorer-rest.adapter";
import { GitHubGraphQLAdapter } from "./adapters/graphql/github-graphql.adapter";
import { FEATURE_KEY } from "./constants/file-explorer.constants";

const defaultRestAdapter = new FileExplorerRestAdapter();
const defaultGitHubAdapter = new GitHubGraphQLAdapter();

export const fileExplorerFeatureConfig = {
  key: FEATURE_KEY,
  reducer: fileExplorerSlice.reducer,
  saga: createManageFileExplorerSaga(defaultRestAdapter, defaultGitHubAdapter),
};

export * from "./schema/file-explorer.schema";
export * from "./domain/entities/file-node.entity";
export * from "./domain/project-templates.catalog";
export * from "./ports/file-explorer.port";
export * from "./ports/github.port";
export * from "./adapters/rest/file-explorer-rest.adapter";
export * from "./adapters/graphql/github-graphql.adapter";
export * from "./data/folder-policy.data";
export * from "./data/badge-resolution.data";
export * from "./data/server-runner.data";
export * from "./data/icon-registry.data";
export * from "./rules/file-explorer.rules";
export * from "./rules/badge-resolution.rules";
export * from "./rules/server-runner.rules";
export * from "./constants/file-explorer.constants";
export * from "./state/file-explorer.slice";
export * from "./readModels/file-explorer.selectors";
export * from "./application/sagas/manage-file-explorer.saga";

export * from "./ui/components/FileIconRenderer";
export * from "./ui/components/FileTreeNode";
export * from "./ui/components/FileExplorerSidebar";
export * from "./ui/components/FileViewerPanel";
export * from "./ui/components/TemplateSelectorBar";
export * from "./ui/components/CreateItemModal";
export * from "./ui/components/OpenVSCodeWorkspace";
export * from "./ui/components/GitHubPushModal";
