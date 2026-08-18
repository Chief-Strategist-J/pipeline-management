import { NextResponse } from "next/server";
import { connectToDatabase } from "@/core/database/mongodb";
import { PROJECT_TEMPLATES_CATALOG } from "@/features/file-explorer/domain/project-templates.catalog";

interface TreeItemNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path?: string;
  content?: string;
  children?: TreeItemNode[];
}

function flattenTreeItems(nodes: TreeItemNode[] = []): Array<{ path: string; content: string }> {
  let rawFiles: Array<{ path: string; content: string }> = [];

  function recurse(items: TreeItemNode[], currentPath = "") {
    if (!Array.isArray(items)) return;

    for (const node of items) {
      if (!node) continue;
      const cleanName = (node.name || "").replace(/\\/g, "/");
      const pathSegment = currentPath ? `${currentPath}/${cleanName}` : cleanName;

      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isFolder = node.type === "folder" || hasChildren;

      if (isFolder && hasChildren) {
        recurse(node.children!, pathSegment);
      } else if (node.type === "file" || !hasChildren) {
        const filePath = node.path ? node.path.replace(/\\/g, "/") : pathSegment;
        rawFiles.push({
          path: filePath,
          content: typeof node.content === "string" ? node.content : "",
        });
      }
    }
  }

  recurse(nodes);

  if (rawFiles.length === 0) return [];

  const firstPath = rawFiles[0].path;
  const firstSlashIdx = firstPath.indexOf("/");

  if (firstSlashIdx !== -1) {
    const candidatePrefix = firstPath.substring(0, firstSlashIdx + 1);
    const allStartWithPrefix = rawFiles.every((f) => f.path.startsWith(candidatePrefix));
    if (allStartWithPrefix) {
      return rawFiles.map((f) => ({
        path: f.path.substring(candidatePrefix.length),
        content: f.content,
      }));
    }
  }

  return rawFiles;
}

export async function POST(req: Request) {
  try {
    const {
      token,
      repoName: inputRepoName,
      branchName: inputBranchName = "main",
      commitMessage = "feat: sync template code tree from OpenVSCode IDE",
      isPrivate = false,
      treeData = [],
    } = await req.json();

    if (!token || !inputRepoName) {
      return NextResponse.json(
        { success: false, error: "GitHub PAT Token and Repository Name are required." },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const targetBranch = inputBranchName.trim() || "main";

    try {
      const { db } = await connectToDatabase();
      await db.collection("github_credentials").updateOne(
        { key: "active_token" },
        {
          $set: {
            key: "active_token",
            token: cleanToken,
            repoName: inputRepoName.trim(),
            branchName: targetBranch,
            isPrivate,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch {}

    const authHeaders = {
      Authorization: `bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Pipeline-Management-IDE",
    };

    const userRes = await fetch("https://api.github.com/user", { headers: authHeaders });
    if (!userRes.ok) {
      const errText = await userRes.text();
      return NextResponse.json(
        { success: false, error: `Invalid GitHub Token: ${userRes.status} ${errText}` },
        { status: 401 }
      );
    }
    const userData = await userRes.json();
    const authenticatedUser = userData.login;

    let owner = authenticatedUser;
    let actualRepo = inputRepoName.trim();
    if (actualRepo.includes("/")) {
      const parts = actualRepo.split("/");
      owner = parts[0];
      actualRepo = parts[1];
    }

    let filesToCommit = flattenTreeItems(treeData);
    if (filesToCommit.length === 0 && PROJECT_TEMPLATES_CATALOG.length > 0) {
      filesToCommit = flattenTreeItems(PROJECT_TEMPLATES_CATALOG[0].tree);
    }

    const graphqlEndpoint = "https://api.github.com/graphql";

    const getRepoQuery = `
      query GetRepoInfo($owner: String!, $name: String!, $branch: String!) {
        repository(owner: $owner, name: $name) {
          id
          url
          nameWithOwner
          ref(qualifiedName: $branch) {
            target {
              oid
            }
          }
          defaultBranchRef {
            name
            target {
              oid
            }
          }
        }
      }
    `;

    let graphqlRes = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        query: getRepoQuery,
        variables: { owner, name: actualRepo, branch: targetBranch },
      }),
    });

    let graphqlData = await graphqlRes.json();
    let repoObj = graphqlData?.data?.repository;
    let repoCreated = false;

    if (!repoObj) {
      const createRepoMutation = `
        mutation CreateRepo($name: String!, $visibility: RepositoryVisibility!) {
          createRepository(input: { name: $name, visibility: $visibility }) {
            repository {
              id
              url
              nameWithOwner
            }
          }
        }
      `;

      const visibility = isPrivate ? "PRIVATE" : "PUBLIC";
      const createRes = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          query: createRepoMutation,
          variables: { name: actualRepo, visibility },
        }),
      });

      const createGqlData = await createRes.json();
      if (createGqlData?.data?.createRepository?.repository) {
        repoObj = createGqlData.data.createRepository.repository;
        repoCreated = true;
      }
    }

    let headOid: string | null = repoObj?.ref?.target?.oid || repoObj?.defaultBranchRef?.target?.oid || null;

    if (headOid) {
      const fileAdditions = filesToCommit.map((f) => ({
        path: f.path.replace(/^\/+/, ""),
        contents: Buffer.from(f.content || "", "utf-8").toString("base64"),
      }));

      const createCommitMutation = `
        mutation CreateCommit($input: CreateCommitOnBranchInput!) {
          createCommitOnBranch(input: $input) {
            commit {
              url
              oid
            }
          }
        }
      `;

      const commitVariables = {
        input: {
          branch: {
            repositoryNameWithOwner: `${owner}/${actualRepo}`,
            branchName: targetBranch,
          },
          message: {
            headline: commitMessage,
          },
          fileChanges: {
            additions: fileAdditions,
          },
          expectedHeadOid: headOid,
        },
      };

      const commitGqlRes = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          query: createCommitMutation,
          variables: commitVariables,
        }),
      });

      const commitGqlData = await commitGqlRes.json();
      if (commitGqlData?.data?.createCommitOnBranch?.commit) {
        const commitObj = commitGqlData.data.createCommitOnBranch.commit;
        const shortHash = commitObj.oid.substring(0, 7);

        try {
          const { db } = await connectToDatabase();
          await db.collection("github_push_history").insertOne({
            shortHash,
            fullHash: commitObj.oid,
            subject: commitMessage,
            author: authenticatedUser,
            repoUrl: `${repoObj.url}/tree/${targetBranch}`,
            repoName: `${owner}/${actualRepo}`,
            branchName: targetBranch,
            fileCount: filesToCommit.length,
            pushedAt: new Date(),
          });
        } catch {}

        return NextResponse.json({
          success: true,
          repoUrl: `${repoObj.url}/tree/${targetBranch}`,
          message: `GitHub GraphQL API v4: Successfully committed and pushed all ${filesToCommit.length} workspace files to repository '${actualRepo}' (Commit SHA: ${shortHash}).`,
        });
      }
    }

    const repoCheckRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}`, {
      headers: authHeaders,
    });

    let repoUrl = `https://github.com/${owner}/${actualRepo}`;

    if (repoCheckRes.status === 404) {
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: actualRepo,
          private: isPrivate,
          auto_init: true,
          description: "Generated by Pipeline Management OpenVSCode IDE",
        }),
      });

      if (!createRepoRes.ok) {
        const createErr = await createRepoRes.text();
        return NextResponse.json(
          { success: false, error: `Failed to create GitHub repo: ${createErr}` },
          { status: 500 }
        );
      }

      const createData = await createRepoRes.json();
      repoUrl = createData.html_url || repoUrl;
      repoCreated = true;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else if (repoCheckRes.ok) {
      const existingRepo = await repoCheckRes.json();
      repoUrl = existingRepo.html_url || repoUrl;
    }

    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${actualRepo}/branches/${targetBranch}`,
      { headers: authHeaders }
    );

    let baseCommitSha: string | null = null;
    let baseTreeSha: string | null = null;

    if (branchRes.ok) {
      const branchData = await branchRes.json();
      baseCommitSha = branchData.commit.sha;
      baseTreeSha = branchData.commit.commit.tree.sha;
    } else {
      const refsRes = await fetch(
        `https://api.github.com/repos/${owner}/${actualRepo}/git/matching-refs/heads/`,
        { headers: authHeaders }
      );
      if (refsRes.ok) {
        const refsData = await refsRes.json();
        if (Array.isArray(refsData) && refsData.length > 0) {
          baseCommitSha = refsData[0].object.sha;

          await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              ref: `refs/heads/${targetBranch}`,
              sha: baseCommitSha,
            }),
          });
        }
      }
    }

    const treeEntries = filesToCommit.map((f) => ({
      path: f.path.replace(/^\/+/, ""),
      mode: "100644",
      type: "blob",
      content: f.content,
    }));

    const createTreeRes = await fetch(
      `https://api.github.com/repos/${owner}/${actualRepo}/git/trees`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          base_tree: baseTreeSha || undefined,
          tree: treeEntries,
        }),
      }
    );

    if (!createTreeRes.ok) {
      const treeErr = await createTreeRes.text();
      return NextResponse.json(
        { success: false, error: `Failed to create Git Tree: ${treeErr}` },
        { status: 500 }
      );
    }
    const newTree = await createTreeRes.json();

    const createCommitRes = await fetch(
      `https://api.github.com/repos/${owner}/${actualRepo}/git/commits`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          message: commitMessage,
          tree: newTree.sha,
          parents: baseCommitSha ? [baseCommitSha] : [],
        }),
      }
    );

    if (!createCommitRes.ok) {
      const commitErr = await createCommitRes.text();
      return NextResponse.json(
        { success: false, error: `Failed to create Git Commit: ${commitErr}` },
        { status: 500 }
      );
    }
    const newCommit = await createCommitRes.json();

    await fetch(
      `https://api.github.com/repos/${owner}/${actualRepo}/git/refs/heads/${targetBranch}`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          sha: newCommit.sha,
          force: true,
        }),
      }
    );

    const shortHash = newCommit.sha.substring(0, 7);

    try {
      const { db } = await connectToDatabase();
      await db.collection("github_push_history").insertOne({
        shortHash,
        fullHash: newCommit.sha,
        subject: commitMessage,
        author: authenticatedUser,
        repoUrl: `${repoUrl}/tree/${targetBranch}`,
        repoName: `${owner}/${actualRepo}`,
        branchName: targetBranch,
        fileCount: filesToCommit.length,
        pushedAt: new Date(),
      });
    } catch {}

    const actionText = repoCreated
      ? `Repository '${actualRepo}' created on GitHub.`
      : `Synchronized with existing repository '${actualRepo}'.`;

    return NextResponse.json({
      success: true,
      repoUrl: `${repoUrl}/tree/${targetBranch}`,
      message: `${actionText} Committed and pushed all ${filesToCommit.length} workspace files to branch '${targetBranch}' (Commit SHA: ${shortHash}). PAT Token saved to MongoDB.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute GitHub code sync." },
      { status: 500 }
    );
  }
}
