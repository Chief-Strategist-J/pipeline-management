import { describe, it, expect } from "vitest";
import {
  fileExplorerSlice,
  launchWorkspace,
  resetLauncher,
  createNode,
} from "../state/file-explorer.slice";
import { OPENVSCODE_PIPELINE_TEMPLATE, NEXTJS_EXTREME_SCALE_TEMPLATE } from "../domain/project-templates.catalog";

describe("fileExplorerSlice", () => {
  it("should initialize unlaunched by default", () => {
    const state = fileExplorerSlice.reducer(undefined, { type: "@@INIT" });
    expect(state.isLaunched).toBe(false);
    expect(state.treeData).toEqual([]);
  });

  it("should launch workspace with selected template", () => {
    const initialState = fileExplorerSlice.reducer(undefined, { type: "@@INIT" });
    const state = fileExplorerSlice.reducer(
      initialState,
      launchWorkspace({ templateId: OPENVSCODE_PIPELINE_TEMPLATE.id })
    );
    expect(state.isLaunched).toBe(true);
    expect(state.activeTemplateId).toBe(OPENVSCODE_PIPELINE_TEMPLATE.id);
    expect(state.treeData[0].name).toBe("pipeline-management");
  });

  it("should reset launcher when reset action is dispatched", () => {
    const initialState = fileExplorerSlice.reducer(undefined, { type: "@@INIT" });
    const launchedState = fileExplorerSlice.reducer(
      initialState,
      launchWorkspace({ templateId: NEXTJS_EXTREME_SCALE_TEMPLATE.id })
    );
    expect(launchedState.isLaunched).toBe(true);

    const resetState = fileExplorerSlice.reducer(launchedState, resetLauncher());
    expect(resetState.isLaunched).toBe(false);
  });

  it("should create new files dynamically in launched workspace", () => {
    const initialState = fileExplorerSlice.reducer(undefined, { type: "@@INIT" });
    const launchedState = fileExplorerSlice.reducer(
      initialState,
      launchWorkspace({ templateId: OPENVSCODE_PIPELINE_TEMPLATE.id })
    );
    const state = fileExplorerSlice.reducer(
      launchedState,
      createNode({ name: "CustomService.ts", type: "file", parentId: "infra-gw", content: "export class CustomService {}" })
    );

    expect(state.openTabs.some((t) => t.name === "CustomService.ts")).toBe(true);
    expect(state.activeTabId).toBeTruthy();
  });
});
