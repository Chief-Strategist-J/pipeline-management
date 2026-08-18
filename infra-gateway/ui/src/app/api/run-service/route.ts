import { NextResponse } from "next/server";
import http from "http";

// Global map to hold active server instances
const activeServers = new Map<number, http.Server>();

function ensureServerRunning(port: number, serviceName: string, lang: string) {
  if (activeServers.has(port)) {
    return { status: "already_running", port };
  }

  try {
    const server = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Content-Type", "application/json");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      res.writeHead(200);
      res.end(
        JSON.stringify(
          {
            service: serviceName,
            status: "HEALTHY",
            language: lang,
            port,
            timestamp: new Date().toISOString(),
            requestUrl: req.url,
            architecture: "Universal Sub-Package (package-structure.md)",
            endpoints: [
              "/",
              "/health",
              "/orders",
              "/metrics",
              "/docs"
            ],
            contracts: {
              openapi: "contracts/openapi/v1.yaml",
              graphql: "contracts/graphql/schema.graphql",
              proto: "contracts/proto/service.proto"
            },
            message: `Live ${serviceName} backend server running on http://localhost:${port}`
          },
          null,
          2
        )
      );
    });

    server.listen(port, "0.0.0.0", () => {
      console.log(`[API RUN SERVICE] Started ${serviceName} server on http://0.0.0.0:${port}`);
    });

    activeServers.set(port, server);
    return { status: "started", port };
  } catch (err: any) {
    console.error(`[API RUN SERVICE] Failed to start server on port ${port}:`, err);
    return { status: "error", message: err.message, port };
  }
}

function stopServer(port: number) {
  const server = activeServers.get(port);
  if (server) {
    server.close();
    activeServers.delete(port);
    return { status: "stopped", port };
  }
  return { status: "not_running", port };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "start", port = 8080, serviceName = "order-service", lang = "Node.js / Express" } = body;

    if (action === "stop") {
      const result = stopServer(port);
      return NextResponse.json(result);
    }

    const result = ensureServerRunning(port, serviceName, lang);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const runningPorts = Array.from(activeServers.keys());
  return NextResponse.json({ activeServers: runningPorts });
}
