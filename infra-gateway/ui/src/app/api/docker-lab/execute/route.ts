import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 120000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 10 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
}

async function isPortInUse(port: number): Promise<boolean> {
  if (!port) return false;
  const { stdout } = await runCmd(`lsof -i :${port} || netstat -tuln | grep -q ":${port} " && echo IN_USE || echo FREE`);
  return stdout.includes("IN_USE") || stdout.includes("LISTEN") || stdout.includes("ESTABLISHED");
}

async function getAvailableHostPort(desiredPort: number): Promise<number> {
  let port = desiredPort;
  while (port < desiredPort + 50) {
    const { stdout } = await runCmd(`docker ps --format '{{.Ports}}' | grep ":${port}->" || true`);
    if (!stdout.trim()) {
      return port;
    }
    port++;
  }
  return desiredPort;
}

async function buildDockerRunCommand(config: any): Promise<{ commands: string[]; containerNames: string[] }> {
  const {
    imageId, tag, containerName, ports = [], envVars = [], volumes = [],
    network, replicas = 1, resources, restartPolicy, customCommand, labels = []
  } = config;

  const image = config.image || imageId;
  const commands: string[] = [];
  const containerNames: string[] = [];
  const baseName = sanitizeName(containerName || imageId);
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  for (let i = 0; i < replicas; i++) {
    const replicaSuffix = replicas > 1 ? `-replica-${i + 1}` : "";
    const name = `dlab-${baseName}-${randomSuffix}${replicaSuffix}`;
    containerNames.push(name);

    const parts: string[] = ["docker", "run", "-d", "--name", name];

    parts.push("--label", "managed-by=infra-gateway-docker-lab");
    parts.push("--label", `image-id=${imageId}`);

    for (const p of ports) {
      const targetHostPort = await getAvailableHostPort(p.hostPort + i);
      parts.push("-p", `${targetHostPort}:${p.containerPort}/${p.protocol || "tcp"}`);
    }

    envVars.forEach((e: any) => {
      parts.push("-e", `${e.key}=${e.value}`);
    });

    volumes.forEach((v: any) => {
      parts.push("-v", `${v.hostPath}:${v.containerPath}:${v.mode || "rw"}`);
    });

    labels.forEach((l: any) => {
      parts.push("--label", `${l.key}=${l.value}`);
    });

    if (network?.mode === "host") parts.push("--network", "host");
    else if (network?.mode === "none") parts.push("--network", "none");
    else if (network?.mode === "custom" && network.customNetworkName) parts.push("--network", network.customNetworkName);

    if (resources?.cpus) parts.push("--cpus", resources.cpus);
    if (resources?.memoryMb) parts.push("--memory", `${resources.memoryMb}m`);
    if (restartPolicy && restartPolicy !== "no") parts.push("--restart", restartPolicy);

    parts.push(`${image}:${tag || "latest"}`);

    if (customCommand) parts.push(...customCommand.split(" "));

    commands.push(parts.join(" "));
  }

  return { commands, containerNames };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config || !config.imageId) {
      return NextResponse.json({ error: "Invalid container configuration" }, { status: 400 });
    }

    const { commands, containerNames } = await buildDockerRunCommand(config);
    const containers: any[] = [];
    let error: string | undefined;

    for (let i = 0; i < commands.length; i++) {
      const targetName = containerNames[i];
      
      await runCmd(`docker rm -f ${targetName}`);

      const { stdout, stderr } = await runCmd(commands[i], 120000);
      
      const stdoutLines = stdout.trim().split("\n").map((l) => l.trim()).filter(Boolean);
      const lastLine = stdoutLines.length > 0 ? stdoutLines[stdoutLines.length - 1] : "";
      
      const containerIdMatches = lastLine.match(/^[a-f0-9]{12,64}$/i);
      const containerId = containerIdMatches ? lastLine.substring(0, 12) : targetName;

      if (stderr && stderr.toLowerCase().includes("error:") && !containerIdMatches) {
        error = stderr;
        continue;
      }

      await runCmd(`docker start ${containerId}`);

      const { stdout: inspectOut } = await runCmd(
        `docker inspect --format '{{.ID}} {{.Name}} {{.State.Status}} {{range $p, $conf := .NetworkSettings.Ports}}{{$p}}->{{(index $conf 0).HostPort}} {{end}}' ${containerId}`
      );

      const parts = inspectOut.trim().split(" ");
      const fullId = (parts[0] || containerId).substring(0, 12);
      const nameFromInspect = (parts[1] || "").replace(/^\//, "");
      const status = parts[2] || "running";
      const portBindings = parts.slice(3).filter(Boolean);

      containers.push({
        containerId: fullId,
        containerName: nameFromInspect || targetName,
        replicaIndex: i + 1,
        status,
        ports: portBindings,
      });
    }

    if (containers.length === 0 && error) {
      return NextResponse.json({ error: `Docker Execution Error: ${error}` }, { status: 500 });
    }

    return NextResponse.json({
      imageId: config.imageId,
      containers,
      startedAt: new Date().toISOString(),
      error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
