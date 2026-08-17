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
    id: "rule-context-sql-database",
    name: "SQL Relational Database Context Parser Rule",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes(IMAGE_IDS.POSTGRES) || img.includes(IMAGE_IDS.POSTGRES) ||
        name.includes(IMAGE_IDS.MYSQL) || img.includes(IMAGE_IDS.MYSQL) ||
        name.includes(IMAGE_IDS.MARIADB) || img.includes(IMAGE_IDS.MARIADB) ||
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
    id: "rule-context-cql-database",
    name: "Cassandra & ScyllaDB CQL Context Parser Rule",
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
    id: "rule-context-redis-inmemory",
    name: "Redis In-Memory Key-Value Context Parser Rule",
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
    id: "rule-context-mongo-document",
    name: "MongoDB Document Database Context Parser Rule",
    priority: RULE_PRIORITIES.CRITICAL - 15,
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
    id: "rule-context-cypher-graph",
    name: "Neo4j Graph Cypher Query Context Parser Rule",
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
    id: "rule-context-vector-ai",
    name: "AI & Vector Engines Context Parser Rule",
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
    id: "rule-context-kafka-messaging",
    name: "Apache Kafka Messaging Context Parser Rule",
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
    id: "rule-context-search-elasticsearch",
    name: "Elasticsearch & Search Engines Context Parser Rule",
    priority: RULE_PRIORITIES.MEDIUM - 5,
    enabled: true,
    condition: (info) => {
      const name = info.name.toLowerCase();
      const img = info.image.toLowerCase();
      return (
        name.includes("elastic") || img.includes("elastic") ||
        name.includes("opensearch") || img.includes("opensearch") ||
        name.includes("meili") || img.includes("meili") ||
        name.includes("typesense") || img.includes("typesense")
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
    id: "rule-context-security-vault",
    name: "HashiCorp Vault Security Context Parser Rule",
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
