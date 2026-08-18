export interface ServiceRunnerMeta {
  name: string;
  lang: string;
  port: number;
  url: string;
  cmd: string;
  framework: string;
}

export interface ServerRunnerDataConfig extends ServiceRunnerMeta {
  matchKey: string;
  priority: number;
}

export const SERVER_RUNNER_DATA_TABLE: ServerRunnerDataConfig[] = [
  {
    matchKey: "python",
    name: "analytics-service",
    lang: "Python 3.11 / FastAPI",
    port: 8000,
    url: "http://localhost:8000",
    cmd: "bash ./scripts/run.sh",
    framework: "Uvicorn",
    priority: 100,
  },
  {
    matchKey: "nextjs",
    name: "web-app",
    lang: "Next.js 15 / Turbopack",
    port: 3000,
    url: "http://localhost:3000",
    cmd: "npm run dev",
    framework: "Next.js Dev Server",
    priority: 100,
  },
  {
    matchKey: "gateway",
    name: "infra-gateway",
    lang: "Envoy / NGINX",
    port: 8443,
    url: "http://localhost:8443",
    cmd: "./edge/tls/start.sh",
    framework: "Gateway Proxy",
    priority: 100,
  },
  {
    matchKey: "default",
    name: "order-service",
    lang: "Node.js / Express TypeScript",
    port: 8080,
    url: "http://localhost:8080",
    cmd: "bash ./scripts/run.sh",
    framework: "Express + tsx",
    priority: 10,
  },
];
