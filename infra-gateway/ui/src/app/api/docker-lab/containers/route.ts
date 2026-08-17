import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { resolveBackupRule } from "@/features/docker-lab/rules/docker-backup.rules";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 25000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 20 });
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
  const backupMode = searchParams.get("backupMode") || "none";
  const legacyBackup = searchParams.get("backup") === "true";

  const mode = backupMode !== "none" ? backupMode : legacyBackup ? "native" : "none";

  if (!containerId) {
    return NextResponse.json({ error: "Missing containerId" }, { status: 400 });
  }

  let backupFilename: string | undefined;
  let backupContent: string | undefined;
  let mimeType: string = "application/octet-stream";

  if (mode !== "none") {
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

    if (mode === "native") {
      const backupRule = resolveBackupRule(imageId, envMap);
      if (backupRule.hasNativeBackup && backupRule.backupCommand) {
        const { stdout: dumpOut } = await runCmd(`docker exec ${containerId} sh -c "${backupRule.backupCommand}"`);
        if (dumpOut.trim()) {
          backupFilename = `native-dump-${imageId}-${containerId.substring(0, 8)}-${ts}.${backupRule.fileExtension}`;
          backupContent = dumpOut;
          mimeType = backupRule.mimeType;
        }
      }
    } else if (mode === "volume") {
      const { stdout: mountsOut } = await runCmd(`docker inspect --format '{{range .Mounts}}{{.Destination}} {{end}}' ${containerId}`);
      const { stdout: logsOut } = await runCmd(`docker logs --tail 500 ${containerId}`);
      const { stdout: inspectOut } = await runCmd(`docker inspect ${containerId}`);

      backupFilename = `volume-archive-${imageId}-${containerId.substring(0, 8)}-${ts}.json`;
      mimeType = "application/json";

      backupContent = JSON.stringify(
        {
          containerId,
          imageId,
          mountDestinations: mountsOut.trim().split(" ").filter(Boolean),
          inspect: inspectOut ? JSON.parse(inspectOut) : [],
          logs: logsOut || "",
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    }

    if (!backupContent) {
      backupFilename = `snapshot-state-${containerId.substring(0, 8)}-${ts}.json`;
      mimeType = "application/json";
      const { stdout: logsOut } = await runCmd(`docker logs --tail 500 ${containerId}`);
      const { stdout: inspectOut } = await runCmd(`docker inspect ${containerId}`);

      backupContent = JSON.stringify(
        {
          containerId,
          imageId,
          timestamp: new Date().toISOString(),
          inspect: inspectOut ? JSON.parse(inspectOut) : [],
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
    mimeType,
  });
}
