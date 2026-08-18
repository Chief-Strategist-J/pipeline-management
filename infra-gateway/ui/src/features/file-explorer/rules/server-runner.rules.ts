import {
  SERVER_RUNNER_DATA_TABLE,
  type ServiceRunnerMeta,
} from "../data/server-runner.data";

export type { ServiceRunnerMeta };

export function resolveServerRunnerRule(templateId?: string): ServiceRunnerMeta {
  const safeId = templateId || "";
  const sortedTable = [...SERVER_RUNNER_DATA_TABLE].sort((a, b) => b.priority - a.priority);

  for (const config of sortedTable) {
    if (config.matchKey !== "default" && safeId.includes(config.matchKey)) {
      return {
        name: config.name,
        lang: config.lang,
        port: config.port,
        url: config.url,
        cmd: config.cmd,
        framework: config.framework,
      };
    }
  }

  const fallback = SERVER_RUNNER_DATA_TABLE.find((c) => c.matchKey === "default")!;
  return {
    name: fallback.name,
    lang: fallback.lang,
    port: fallback.port,
    url: fallback.url,
    cmd: fallback.cmd,
    framework: fallback.framework,
  };
}
