import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 10000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const containerId = searchParams.get("containerId");

  if (!containerId) {
    return NextResponse.json({ error: "Missing containerId" }, { status: 400 });
  }

  const { stdout, stderr } = await runCmd(`docker logs --tail 100 --timestamps ${containerId}`);

  if (stderr && (stderr.includes("No such container") || stderr.includes("Error response from daemon"))) {
    return NextResponse.json([]);
  }

  const rawOutput = (stdout + "\n" + stderr).trim();

  const logs = rawOutput
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line && !line.includes("Error response from daemon"))
    .map((line) => {
      const spaceIdx = line.indexOf(" ");
      const timestamp = spaceIdx > 0 && line.substring(0, spaceIdx).includes("T")
        ? line.substring(0, spaceIdx)
        : new Date().toISOString();
      const message = spaceIdx > 0 && line.substring(0, spaceIdx).includes("T")
        ? line.substring(spaceIdx + 1)
        : line;
      return {
        containerId,
        timestamp,
        stream: "stdout" as const,
        message,
      };
    });

  return NextResponse.json(logs);
}
