import type { FlatFileEntry } from "./tree-flattening.service";

export interface GraphQLCommitParams {
  authHeaders: Record<string, string>;
  owner: string;
  repo: string;
  branch: string;
  commitMessage: string;
  authenticatedUser: string;
  isPrivate: boolean;
  filesToCommit: FlatFileEntry[];
}

export interface GraphQLCommitResult {
  success: boolean;
  shortHash?: string;
  fullHash?: string;
  repoUrl?: string;
  error?: string;
}

export class GitHubGraphQLService {
  private static endpoint = "https://api.github.com/graphql";

  public static async executePushPipeline(params: GraphQLCommitParams): Promise<GraphQLCommitResult> {
    const { authHeaders, owner, repo, branch, commitMessage, isPrivate, filesToCommit } = params;

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

    let res = await fetch(this.endpoint, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        query: getRepoQuery,
        variables: { owner, name: repo, branch },
      }),
    });

    let graphqlData = await res.json();
    let repoObj = graphqlData?.data?.repository;

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
      const createRes = await fetch(this.endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          query: createRepoMutation,
          variables: { name: repo, visibility },
        }),
      });

      const createGqlData = await createRes.json();
      if (createGqlData?.data?.createRepository?.repository) {
        repoObj = createGqlData.data.createRepository.repository;
      }
    }

    let headOid: string | null = repoObj?.ref?.target?.oid || repoObj?.defaultBranchRef?.target?.oid || null;

    if (!headOid) {
      return { success: false, error: "Repository head OID not found in GraphQL response." };
    }

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

    const commitGqlRes = await fetch(this.endpoint, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        query: createCommitMutation,
        variables: {
          input: {
            branch: {
              repositoryNameWithOwner: `${owner}/${repo}`,
              branchName: branch,
            },
            message: { headline: commitMessage },
            fileChanges: { additions: fileAdditions },
            expectedHeadOid: headOid,
          },
        },
      }),
    });

    const commitGqlData = await commitGqlRes.json();
    if (commitGqlData?.data?.createCommitOnBranch?.commit) {
      const commitObj = commitGqlData.data.createCommitOnBranch.commit;
      const fullHash = commitObj.oid;
      return {
        success: true,
        fullHash,
        shortHash: fullHash.substring(0, 7),
        repoUrl: `${repoObj.url}/tree/${branch}`,
      };
    }

    const errMessage = commitGqlData?.errors?.[0]?.message || "GraphQL createCommitOnBranch mutation failed.";
    return { success: false, error: errMessage };
  }
}
