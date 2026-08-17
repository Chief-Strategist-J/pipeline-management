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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, probeType = "tcp", port, path } = body;

    if (!containerId) {
      return NextResponse.json({ error: "Missing containerId" }, { status: 400 });
    }

    const startMs = Date.now();

    const { stdout: ipOut } = await runCmd(
      `docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`
    );
    const containerIp = ipOut.trim();

    let probeOutput = "";
    let healthy = false;

    if (probeType === "http" && port) {
      const url = `http://${containerIp}:${port}${path || "/"}`;
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c "wget -qO- --timeout=5 ${url} 2>&1 || curl -sf --max-time 5 ${url} 2>&1 || echo PROBE_FAILED"`, 10000);
      probeOutput = (stdout || stderr).trim();
      healthy = !probeOutput.includes("PROBE_FAILED") && !probeOutput.includes("Connection refused");
    } else if (probeType === "tcp" && port) {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c "echo > /dev/tcp/${containerIp}/${port} 2>&1 && echo TCP_OK || (nc -z -w5 ${containerIp} ${port} 2>&1 && echo TCP_OK || echo PROBE_FAILED)"`, 10000);
      probeOutput = (stdout || stderr).trim();
      healthy = probeOutput.includes("TCP_OK") || !probeOutput.includes("PROBE_FAILED");
    } else {
      const { stdout: statusOut } = await runCmd(`docker inspect --format '{{.State.Status}}' ${containerId}`);
      healthy = statusOut.trim() === "running";
      probeOutput = `Container status: ${statusOut.trim()}`;
    }

    const latencyMs = Date.now() - startMs;

    return NextResponse.json({
      containerId,
      healthy,
      latencyMs,
      probeType,
      probeOutput: probeOutput || `Probe completed (${latencyMs}ms)`,
      testedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
