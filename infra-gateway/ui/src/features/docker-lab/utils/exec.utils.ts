import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function runCmd(command: string, timeoutMs: number = 25000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}
