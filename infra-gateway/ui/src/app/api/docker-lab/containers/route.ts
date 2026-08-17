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

export async function GET() {
  const { stdout } = await runCmd(
    `docker ps --filter "label=managed-by=infra-gateway-docker-lab" --format '{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}|{{.Image}}'`
  );

  const containers = stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, name, status, ports, image] = line.split("|");
      return {
        containerId: id,
        containerName: name,
        replicaIndex: 1,
        status: status?.toLowerCase().includes("up") ? "running" : "exited",
        ports: ports ? ports.split(",").map((p: string) => p.trim()) : [],
        image,
      };
    });

  return NextResponse.json(containers);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const containerId = searchParams.get("containerId");
  const backup = searchParams.get("backup") === "true";

  if (!containerId) {
    return NextResponse.json({ error: "Missing containerId" }, { status: 400 });
  }

  let backupPath: string | undefined;

  if (backup) {
    const ts = Date.now();
    backupPath = `/tmp/docker-lab-backup-${containerId}-${ts}`;
    const { stdout: mountsOut } = await runCmd(
      `docker inspect --format '{{range .Mounts}}{{.Destination}} {{end}}' ${containerId}`
    );

    const mountPaths = mountsOut.trim().split(" ").filter(Boolean);

    if (mountPaths.length > 0) {
      await runCmd(`mkdir -p ${backupPath}`);
      for (const mp of mountPaths) {
        const safeName = mp.replace(/\//g, "_");
        await runCmd(`docker cp ${containerId}:${mp} ${backupPath}/${safeName}`, 30000);
      }
    }
  }

  await runCmd(`docker stop ${containerId}`, 15000);
  await runCmd(`docker rm ${containerId}`, 10000);

  return NextResponse.json({ success: true, backupPath });
}
