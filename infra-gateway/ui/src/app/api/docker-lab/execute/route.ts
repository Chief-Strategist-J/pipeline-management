import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import type { ContainerConfig } from "@/features/docker-lab/domain/entities/docker-image.entity";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 30000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 10 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const configList: ContainerConfig[] = Array.isArray(body.configs)
      ? body.configs
      : body.config
      ? [body.config]
      : Array.isArray(body)
      ? body
      : [body];

    if (!configList.length || !configList[0]?.imageId) {
      return NextResponse.json({ error: "Invalid ContainerConfig payload" }, { status: 400 });
    }

    const networkName = body.networkName || configList[0].network?.customNetworkName || "shared-lab-net";

    await runCmd(`docker network create ${networkName} || true`);

    const results = [];

    for (let i = 0; i < configList.length; i++) {
      const config = configList[i];
      const baseName = config.containerName || `${config.imageId}-node`;
      const name = `${baseName}-${Date.now().toString(36).substring(4)}`;
      const alias = config.imageId;

      await runCmd(`docker rm -f ${baseName} ${name} || true`);

      let portFlags = "";
      (config.ports || []).forEach((p) => {
        if (p.hostPort && p.containerPort) {
          portFlags += ` -p ${p.hostPort}:${p.containerPort}/${p.protocol || "tcp"}`;
        }
      });

      let envFlags = "";
      (config.envVars || []).forEach((e) => {
        if (e.key) {
          envFlags += ` -e "${e.key}=${e.value || ""}"`;
        }
      });

      const labelFlags = ` --label managed-by=infra-gateway-docker-lab --label image-id=${config.imageId}`;

      const runCommand = `docker run -d --name ${name} --network ${networkName} --network-alias ${alias}${portFlags}${envFlags}${labelFlags} ${config.imageId}:${config.tag || "latest"}`;

      let { stdout: containerId, stderr } = await runCmd(runCommand);

      if (!containerId.trim() && stderr.includes("port is already allocated")) {
        const noPortCommand = `docker run -d --name ${name} --network ${networkName} --network-alias ${alias}${envFlags}${labelFlags} ${config.imageId}:${config.tag || "latest"}`;
        const retryRes = await runCmd(noPortCommand);
        containerId = retryRes.stdout;
        stderr = retryRes.stderr;
      }

      if (containerId.trim()) {
        results.push({
          containerId: containerId.trim().substring(0, 12),
          containerName: name,
          imageId: config.imageId,
          status: "running",
          ports: (config.ports || []).map((p) => `${p.hostPort}:${p.containerPort}`),
        });
      } else {
        results.push({
          containerId: "",
          containerName: name,
          imageId: config.imageId,
          status: "error",
          error: stderr || "Container startup failed",
          ports: [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      networkName,
      containers: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Multi-container stack execution failed" }, { status: 500 });
  }
}
