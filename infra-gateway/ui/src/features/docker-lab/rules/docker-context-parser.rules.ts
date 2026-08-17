/**
 * Phase 0: Context Preparation & Dynamic Parsing Rules Engine (dockerContextParserRules)
 * 
 * ALGORITHM:
 * 1. Filter enabled rules (rule.enabled === true).
 * 2. Sort rules by rule.priority descending (100 -> 90 -> 10).
 * 3. Match rule.condition(info, rawCommand) against container image name and command.
 * 4. Parse container-specific comment formats (-- for SQL, # for Redis/Kafka, // for Mongo/JSON).
 * 5. Return standardized RuleContext object containing containerName, image, env, rawCommand, codeLines, and isSql.
 */

import type { RuleContext } from "@/core/rules-engine/rule.types";
import { IMAGE_IDS, RULE_PRIORITIES } from "../constants/docker-lab.constants";

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
    id: `rule-context-${IMAGE_IDS.POSTGRES}`,
    name: `${IMAGE_IDS.POSTGRES} SQL Relational Database Context Parser Rule`,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes(IMAGE_IDS.POSTGRES) || img.includes(IMAGE_IDS.POSTGRES) ||
        name.includes(IMAGE_IDS.MYSQL) || img.includes(IMAGE_IDS.MYSQL) ||
        name.includes(IMAGE_IDS.MARIADB) || img.includes(IMAGE_IDS.MARIADB) ||
        name.includes(IMAGE_IDS.COCKROACHDB) || img.includes(IMAGE_IDS.COCKROACHDB) ||
        name.includes(IMAGE_IDS.TIMESCALEDB) || img.includes(IMAGE_IDS.TIMESCALEDB) ||
        name.includes(IMAGE_IDS.CLICKHOUSE) || img.includes(IMAGE_IDS.CLICKHOUSE)
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
    id: `rule-context-${IMAGE_IDS.CASSANDRA}`,
    name: `${IMAGE_IDS.CASSANDRA} & ${IMAGE_IDS.SCYLLADB} CQL Context Parser Rule`,
    priority: RULE_PRIORITIES.CRITICAL - 5,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes(IMAGE_IDS.CASSANDRA) || img.includes(IMAGE_IDS.CASSANDRA) ||
        name.includes(IMAGE_IDS.SCYLLADB) || img.includes(IMAGE_IDS.SCYLLADB)
      );
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("--") && !l.startsWith("//"));
      const codeLines = lines.join(" ");
      const isSql = /^(select|create|insert|update|delete|drop|alter|use|describe)\b/i.test(codeLines);

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
    id: `rule-context-${IMAGE_IDS.REDIS}`,
    name: `${IMAGE_IDS.REDIS} In-Memory Key-Value Context Parser Rule`,
    priority: RULE_PRIORITIES.CRITICAL - 10,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes(IMAGE_IDS.REDIS) || img.includes(IMAGE_IDS.REDIS);
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
    id: `rule-context-${IMAGE_IDS.MONGODB}`,
    name: `${IMAGE_IDS.MONGODB} Document Database Context Parser Rule`,
    priority: RULE_PRIORITIES.CRITICAL - 15,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes(IMAGE_IDS.MONGODB) || img.includes("mongo");
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
    id: `rule-context-${IMAGE_IDS.NEO4J}`,
    name: `${IMAGE_IDS.NEO4J} Graph Cypher Query Context Parser Rule`,
    priority: RULE_PRIORITIES.HIGH,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes(IMAGE_IDS.NEO4J) || img.includes(IMAGE_IDS.NEO4J);
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
    id: `rule-context-${IMAGE_IDS.QDRANT}`,
    name: `AI Vector Engines Context Parser Rule`,
    priority: RULE_PRIORITIES.HIGH - 5,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes(IMAGE_IDS.QDRANT) || img.includes(IMAGE_IDS.QDRANT) ||
        name.includes(IMAGE_IDS.MILVUS) || img.includes(IMAGE_IDS.MILVUS) ||
        name.includes(IMAGE_IDS.WEAVIATE) || img.includes(IMAGE_IDS.WEAVIATE) ||
        name.includes(IMAGE_IDS.CHROMA) || img.includes(IMAGE_IDS.CHROMA)
      );
    },
    parse: (info, rawCommand) => {
      const cleaned = (rawCommand || "").trim();
      const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
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
    id: `rule-context-${IMAGE_IDS.KAFKA}`,
    name: `${IMAGE_IDS.KAFKA} Messaging Context Parser Rule`,
    priority: RULE_PRIORITIES.MEDIUM,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes(IMAGE_IDS.KAFKA) || img.includes(IMAGE_IDS.KAFKA);
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
    id: `rule-context-${IMAGE_IDS.ELASTICSEARCH}`,
    name: `${IMAGE_IDS.ELASTICSEARCH} Search Engines Context Parser Rule`,
    priority: RULE_PRIORITIES.MEDIUM - 5,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes("elastic") || img.includes("elastic") ||
        name.includes(IMAGE_IDS.OPENSEARCH) || img.includes(IMAGE_IDS.OPENSEARCH) ||
        name.includes(IMAGE_IDS.MEILISEARCH) || img.includes(IMAGE_IDS.MEILISEARCH) ||
        name.includes(IMAGE_IDS.TYPESENSE) || img.includes(IMAGE_IDS.TYPESENSE)
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
    id: `rule-context-${IMAGE_IDS.VAULT}`,
    name: `${IMAGE_IDS.VAULT} Security Context Parser Rule`,
    priority: RULE_PRIORITIES.MEDIUM - 10,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return name.includes(IMAGE_IDS.VAULT) || img.includes(IMAGE_IDS.VAULT);
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
    id: "rule-context-default-fallback",
    name: "Default Standard Shell Context Parser Fallback Rule",
    priority: RULE_PRIORITIES.FALLBACK,
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
