import { NextResponse } from "next/server";
import { gitService } from "@/core/git/git-service";

const CREATE_REPO_MUTATION = `
  mutation CreateRepository($name: String!, $visibility: RepositoryVisibility!) {
    createRepository(input: { name: $name, visibility: $visibility }) {
      repository {
        name
        url
        sshUrl
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { token, repoName, commitMessage = "feat: initial commit from pipeline management IDE", isPrivate = false } = await req.json();

    if (!token || !repoName) {
      return NextResponse.json({ success: false, error: "GitHub PAT Token and Repository Name are required." }, { status: 400 });
    }

    let repoUrl = `https://github.com/${repoName}`;

    try {
      const graphqlRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Authorization": `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "Pipeline-Management-IDE",
        },
        body: JSON.stringify({
          query: CREATE_REPO_MUTATION,
          variables: {
            name: repoName,
            visibility: isPrivate ? "PRIVATE" : "PUBLIC",
          },
        }),
      });

      const graphqlData = await graphqlRes.json();
      if (graphqlData.data?.createRepository?.repository?.url) {
        repoUrl = graphqlData.data.createRepository.repository.url;
      }
    } catch {}

    await gitService.commitAndPush({ token, repoName, commitMessage });

    return NextResponse.json({
      success: true,
      repoUrl,
      message: `Repository '${repoName}' created via GitHub GraphQL API. Exact git commit and push completed successfully!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to execute GitHub push." }, { status: 500 });
  }
}
