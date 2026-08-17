import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { resolveBackupRule } from "@/features/docker-lab/rules/docker-backup.rules";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 20000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 10 });
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
    const { stdout: labelImageId } = await runCmd(`docker inspect --format '{{index .Config.Labels "image-id"}}' ${containerId}`);
    const { stdout: imageRepo } = await runCmd(`docker inspect --format '{{.Config.Image}}' ${containerId}`);
    const { stdout: envRaw } = await runCmd(`docker inspect --format '{{range .Config.Env}}{{.}} {{end}}' ${containerId}`);

    const imageId = labelImageId.trim() || imageRepo.trim() || "default";

    const envMap: Record<string, string> = {};
    envRaw.trim().split(" ").forEach((item) => {
      const eqIdx = item.indexOf("=");
      if (eqIdx > 0) envMap[item.substring(0, eqIdx)] = item.substring(eqIdx + 1);
    });

    const backupRule = resolveBackupRule(imageId, envMap);

    if (backupRule.hasNativeBackup && backupRule.backupCommand) {
      const { stdout: dumpOut } = await runCmd(
        `docker exec ${containerId} sh -c "${backupRule.backupCommand}"`
      );

      if (dumpOut.trim()) {
        backupFilename = `backup-${imageId}-${containerId.substring(0, 8)}-${ts}.${backupRule.fileExtension}`;
        backupContent = dumpOut;
      }
    }

    if (!backupContent) {
      backupFilename = `backup-metadata-${containerId.substring(0, 8)}-${ts}.json`;
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
          imageId,
          timestamp: new Date().toISOString(),
          inspect: parsedInspect,
          logs: logsOut || "",
        },
        null,
        2
      );
    }
  }

  await runCmd(`docker rm -f ${containerId}`);

  return NextResponse.json({
    success: true,
    containerId,
    backupFilename,
    backupContent,
  });
}
