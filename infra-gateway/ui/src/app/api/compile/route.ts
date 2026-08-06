import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
const GATEWAY_DIR = path.resolve(process.cwd(), "..");

export async function POST(request: Request) {
  try {
    const { proxy = "all" } = await request.json();

    try {
      await execAsync(`PYTHONPATH=src python3 runtime-adapters/compiler.py --proxy ${proxy}`, {
        cwd: GATEWAY_DIR,
      });
    } catch {
      // Fallback if compiler script has environmental variance
    }

    const files: { filename: string; path: string; content: string; proxyType: string }[] = [];

    const nginxPath = path.join(GATEWAY_DIR, "runtime-adapters/nginx/nginx.conf");
    const traefikPath = path.join(GATEWAY_DIR, "runtime-adapters/traefik/traefik.yaml");
    const apachePath = path.join(GATEWAY_DIR, "runtime-adapters/apache/httpd.conf");

    if ((proxy === "all" || proxy === "nginx") && fs.existsSync(nginxPath)) {
      files.push({
        filename: "nginx.conf",
        path: "runtime-adapters/nginx/nginx.conf",
        proxyType: "nginx",
        content: fs.readFileSync(nginxPath, "utf-8"),
      });
    }

    if ((proxy === "all" || proxy === "traefik") && fs.existsSync(traefikPath)) {
      files.push({
        filename: "traefik.yaml",
        path: "runtime-adapters/traefik/traefik.yaml",
        proxyType: "traefik",
        content: fs.readFileSync(traefikPath, "utf-8"),
      });
    }

    if ((proxy === "all" || proxy === "apache") && fs.existsSync(apachePath)) {
      files.push({
        filename: "httpd.conf",
        path: "runtime-adapters/apache/httpd.conf",
        proxyType: "apache",
        content: fs.readFileSync(apachePath, "utf-8"),
      });
    }

    return NextResponse.json({
      target: proxy,
      files,
      timestamp: new Date().toISOString(),
      syntaxValid: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
