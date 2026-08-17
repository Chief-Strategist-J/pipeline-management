import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 15000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, command } = body;

    if (!containerId || !command) {
      return NextResponse.json({ error: "containerId and command are required" }, { status: 400 });
    }

    const safeCmd = command.replace(/"/g, '\\"');
    
    let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c "${safeCmd}"`, 15000);

    if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
      const retryRes = await runCmd(`docker exec ${containerId} ${command}`, 15000);
      stdout = retryRes.stdout;
      stderr = retryRes.stderr;
    }

    const combinedOutput = [stdout, stderr]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join("\n");

    const isErrorExit = Boolean(
      stderr &&
      !stdout &&
      (stderr.includes("Error:") || stderr.includes("No such container") || stderr.includes("command not found"))
    );

    return NextResponse.json({
      exitCode: isErrorExit ? 1 : 0,
      output: combinedOutput || "(Command executed with no output)",
    });
  } catch (err: any) {
    return NextResponse.json({ exitCode: 1, output: err.message }, { status: 500 });
  }
}
