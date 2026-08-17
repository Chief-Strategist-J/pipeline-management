import type { RuleContext } from "@/core/rules-engine/rule.types";

export interface ContextParserRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  condition: (info: { name: string; image: string; env: Record<string, string> }, rawCommand: string) => boolean;
  parse: (info: { name: string; image: string; env: Record<string, string> }, rawCommand: string) => RuleContext;
}

export const dockerContextParserRules: ContextParserRule[] = [
  {
    id: "rule-context-sql-database",
    name: "SQL Relational Database Context Parser Rule",
    priority: 90,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes("postgres") || img.includes("postgres") ||
        name.includes("mysql") || img.includes("mysql") ||
        name.includes("mariadb") || img.includes("mariadb") ||
        name.includes("cockroach") || img.includes("cockroach") ||
        name.includes("timescale") || img.includes("timescale") ||
        name.includes("clickhouse") || img.includes("clickhouse")
      );
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("--") && !l.startsWith("//") && !l.startsWith("/*"));
      const codeLines = lines.join(" ");
      const isSql = /^(select|create|insert|update|delete|drop|alter|show|grant|revoke|with|\\d|\\l)\b/i.test(codeLines);

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql,
      };
    },
  },
  {
    id: "rule-context-redis-inmemory",
    name: "Redis In-Memory Key-Value Context Parser Rule",
    priority: 85,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes("redis") || img.includes("redis");
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));
      const codeLines = lines.join(" ");

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql: false,
      };
    },
  },
  {
    id: "rule-context-mongo-document",
    name: "MongoDB Document Database Context Parser Rule",
    priority: 80,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes("mongo") || img.includes("mongo");
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("//") && !l.startsWith("/*"));
      const codeLines = lines.join(" ");

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql: false,
      };
    },
  },
  {
    id: "rule-context-kafka-messaging",
    name: "Apache Kafka Messaging Context Parser Rule",
    priority: 75,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes("kafka") || img.includes("kafka");
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));
      const codeLines = lines.join(" ");

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql: false,
      };
    },
  },
  {
    id: "rule-context-search-elasticsearch",
    name: "Elasticsearch & Search Engines Context Parser Rule",
    priority: 70,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes("elastic") || img.includes("elastic") ||
        name.includes("opensearch") || img.includes("opensearch") ||
        name.includes("meili") || img.includes("meili")
      );
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("//") && !l.startsWith("#"));
      const codeLines = lines.join(" ");

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql: false,
      };
    },
  },
  {
    id: "rule-context-default-fallback",
    name: "Default Standard Shell Context Parser Fallback Rule",
    priority: 10,
    enabled: true,
    condition: () => true,
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && !l.startsWith("//") && !l.startsWith("--"));
      const codeLines = lines.join(" ");
      const isSql = /^(select|create|insert|update|delete|drop|alter|show|grant|revoke|with)\b/i.test(codeLines);

      return {
        containerName: info.name,
        image: info.image,
        env: info.env,
        rawCommand,
        codeLines,
        isSql,
      };
    },
  },
];

export function resolveRuleContext(
  rules: ContextParserRule[],
  info: { name: string; image: string; env: Record<string, string> },
  rawCommand: string
): RuleContext {
  const active = rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
  for (const rule of active) {
    if (rule.condition(info, rawCommand)) {
      return rule.parse(info, rawCommand);
    }
  }
  return dockerContextParserRules[dockerContextParserRules.length - 1].parse(info, rawCommand);
}
