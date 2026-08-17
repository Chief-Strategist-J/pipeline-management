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
    `docker ps --filter "label=managed-by=infra-gateway-docker-lab" --format '{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}|{{.Image}}|{{.Label "image-id"}}'`
  );

  const containers = stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, name, status, ports, image, labelImageId] = line.split("|");
      return {
        containerId: id,
        containerName: name,
        replicaIndex: 1,
        status: status?.toLowerCase().includes("up") ? "running" : "exited",
        ports: ports ? ports.split(",").map((p: string) => p.trim()) : [],
        image,
        imageId: labelImageId || image,
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

  let backupFilename: string | undefined;
  let backupContent: string | undefined;

  if (backup) {
    const ts = Date.now();
    backupFilename = `docker-lab-backup-${containerId.substring(0, 8)}-${ts}.json`;

    const { stdout: logsOut } = await runCmd(`docker logs --tail 500 ${containerId}`);
    const { stdout: inspectOut } = await runCmd(`docker inspect ${containerId}`);

    let parsedInspect: any = [];
    try {
      parsedInspect = inspectOut ? JSON.parse(inspectOut) : [];
    } catch {
      parsedInspect = inspectOut;
    }

    backupContent = JSON.stringify(
      {
        containerId,
        timestamp: new Date().toISOString(),
        inspect: parsedInspect,
        logs: logsOut || "",
      },
      null,
      2
    );
  }

  await runCmd(`docker rm -f ${containerId}`);

  return NextResponse.json({
    success: true,
    containerId,
    backupFilename,
    backupContent,
  });
}
