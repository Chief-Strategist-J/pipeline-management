import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface GitCommitPushOptions {
  cwd?: string;
  token: string;
  repoName: string;
  commitMessage: string;
  remoteName?: string;
}

export const gitService = {
  async commitAndPush(options: GitCommitPushOptions): Promise<{ success: boolean; output: string }> {
    const { cwd = process.cwd(), token, repoName, commitMessage, remoteName = "origin_github" } = options;
    const authRemoteUrl = `https://${token}@github.com/${repoName}.git`;

    const commands = [
      `git config user.name "Pipeline IDE Bot"`,
      `git config user.email "bot@pipeline-management.local"`,
      `git add .`,
      `git commit -m "${commitMessage.replace(/"/g, '\\"')}" || true`,
      `git remote remove ${remoteName} || true`,
      `git remote add ${remoteName} "${authRemoteUrl}"`,
      `git push -u ${remoteName} HEAD:main --force || true`,
    ];

    let fullOutput = "";
    for (const cmd of commands) {
      const { stdout, stderr } = await execAsync(cmd, { cwd });
      fullOutput += `${stdout}\n${stderr}\n`;
    }

    return { success: true, output: fullOutput };
  },
};
