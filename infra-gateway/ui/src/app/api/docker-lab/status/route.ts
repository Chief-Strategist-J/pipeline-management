import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 30000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

async function isDockerAvailable(): Promise<{ available: boolean; version?: string; error?: string }> {
  try {
    const { stdout, stderr } = await runCmd("docker --version", 5000);
    if (stderr && !stdout) return { available: false, error: stderr };
    const { stdout: infoOut } = await runCmd("docker info --format '{{.ServerVersion}}'", 5000);
    return { available: true, version: stdout.trim(), error: infoOut.includes("permission denied") ? "Docker daemon requires elevated permissions. Run: sudo usermod -aG docker $USER && newgrp docker" : undefined };
  } catch {
    return { available: false, error: "Docker is not installed on this system." };
  }
}

async function installDocker(): Promise<{ success: boolean; output: string }> {
  const steps = [
    "sudo apt-get update -y",
    "sudo apt-get install -y ca-certificates curl gnupg lsb-release",
    "sudo install -m 0755 -d /etc/apt/keyrings",
    "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes",
    "sudo chmod a+r /etc/apt/keyrings/docker.gpg",
    `echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
    "sudo apt-get update -y",
    "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    `sudo usermod -aG docker ${process.env.USER || "$(whoami)"}`,
  ];

  let fullOutput = "";
  for (const step of steps) {
    const { stdout, stderr } = await runCmd(step, 120000);
    fullOutput += `$ ${step}\n${stdout}${stderr}\n\n`;
  }

  const check = await isDockerAvailable();
  return { success: check.available, output: fullOutput };
}

export async function GET() {
  const status = await isDockerAvailable();
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "install") {
      const result = await installDocker();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
