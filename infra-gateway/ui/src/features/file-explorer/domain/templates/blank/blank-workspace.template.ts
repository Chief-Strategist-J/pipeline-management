import { createGenericTree } from "../builder/sub-package-tree.builder";

export const BLANK_WORKSPACE_TEMPLATE = createGenericTree(
  "blank-workspace",
  "Blank Workspace (Empty Folder)",
  "Start with an empty root folder and create custom files and directories from scratch",
  "blank",
  "new-project",
  [
    {
      id: "root-blank",
      name: "new-project",
      path: "new-project",
      type: "folder",
      children: [
        {
          id: "blank-file-readme",
          name: "README.md",
          path: "new-project/README.md",
          type: "file",
          content: "# New Project\nCreated with OpenVSCode Folder Generator.",
        },
      ],
    },
  ]
);
