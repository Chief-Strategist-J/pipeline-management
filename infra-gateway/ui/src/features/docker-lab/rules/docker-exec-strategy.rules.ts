/**
 * Phase 2: Execution Strategy & Error Exit Post-Processing Rules Engine (dockerExecStrategyRules)
 * 
 * ALGORITHM:
 * 1. Filter enabled strategy rules (rule.enabled === true).
 * 2. Sort rules by rule.priority descending (100 -> 10).
 * 3. Match rule.condition(ctx) against container image name and metadata.
 * 4. Execute container command via base image strategy (Distroless Direct Exec vs Standard Shell Wrapper).
 * 5. Evaluate container-specific error signatures (psql error, ERROR 1045, MongoServerError, Redis error)
 *    and return ExecutionStrategyResult { stdout, stderr, isErrorExit, output }.
 */

import type { RuleContext } from "@/core/rules-engine/rule.types";
import { IMAGE_IDS, RULE_PRIORITIES } from "../constants/docker-lab.constants";
import { runCmd } from "../utils/exec.utils";

export interface ExecutionStrategyResult {
  stdout: string;
  stderr: string;
  isErrorExit: boolean;
  output: string;
}

export interface ExecutionStrategyRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  condition: (ctx: RuleContext) => boolean;
  execute: (ctx: RuleContext, containerId: string, finalCmd: string) => Promise<ExecutionStrategyResult>;
}

export const dockerExecStrategyRules: ExecutionStrategyRule[] = [
  {
    id: `rule-strategy-${IMAGE_IDS.REDIS}`,
    name: "Redis In-Memory Execution Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.REDIS) || ctx.image.toLowerCase().includes(IMAGE_IDS.REDIS),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stdout.includes("(error) ERR") || stdout.includes("WRONGTYPE") || stdout.includes("NOAUTH") || (stderr && !stdout));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.POSTGRES}`,
    name: "PostgreSQL Database Execution Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.POSTGRES) || ctx.image.toLowerCase().includes(IMAGE_IDS.POSTGRES),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stderr && (stderr.includes("psql: error:") || stderr.includes("FATAL:") || stderr.includes("ERROR:")));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Query executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.MYSQL}`,
    name: "MySQL Server Execution Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MYSQL) || ctx.image.toLowerCase().includes(IMAGE_IDS.MYSQL),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stderr && !stdout && (stderr.includes("ERROR 1") || stderr.includes("Access denied")));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Query executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.MARIADB}`,
    name: "MariaDB Server Execution Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MARIADB) || ctx.image.toLowerCase().includes(IMAGE_IDS.MARIADB),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stderr && !stdout && (stderr.includes("ERROR 1") || stderr.includes("Access denied")));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Query executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.MONGODB}`,
    name: "MongoDB Document Database Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MONGODB) || ctx.image.toLowerCase().includes("mongo"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stderr && (stderr.includes("MongoServerError") || stderr.includes("AuthenticationFailed")));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.INFLUXDB}`,
    name: "InfluxDB Time Series Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.INFLUXDB) || ctx.image.toLowerCase().includes(IMAGE_IDS.INFLUXDB),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.CASSANDRA}`,
    name: "Apache Cassandra Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CASSANDRA) || ctx.image.toLowerCase().includes(IMAGE_IDS.CASSANDRA),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && (stderr.includes("SyntaxException") || stderr.includes("InvalidRequest"))), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.COCKROACHDB}`,
    name: "CockroachDB Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("cockroach") || ctx.image.toLowerCase().includes("cockroach"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.TIMESCALEDB}`,
    name: "TimescaleDB Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("timescale") || ctx.image.toLowerCase().includes("timescale"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && stderr.includes("psql: error:")), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.SCYLLADB}`,
    name: "ScyllaDB Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("scylla") || ctx.image.toLowerCase().includes("scylla"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.SURREALDB}`,
    name: "SurrealDB Distroless Direct Execution Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("surreal") || ctx.image.toLowerCase().includes("surreal"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout && stderr.includes("Error:")), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.CLICKHOUSE}`,
    name: "ClickHouse Server Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("clickhouse") || ctx.image.toLowerCase().includes("clickhouse"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && stderr.includes("Code:")), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.NEO4J}`,
    name: "Neo4j Graph Database Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.NEO4J) || ctx.image.toLowerCase().includes(IMAGE_IDS.NEO4J),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },

  {
    id: `rule-strategy-${IMAGE_IDS.QDRANT}`,
    name: "Qdrant Vector Engine Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.QDRANT) || ctx.image.toLowerCase().includes(IMAGE_IDS.QDRANT),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.MILVUS}`,
    name: "Milvus Vector Database Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MILVUS) || ctx.image.toLowerCase().includes(IMAGE_IDS.MILVUS),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.WEAVIATE}`,
    name: "Weaviate Semantic Database Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.WEAVIATE) || ctx.image.toLowerCase().includes(IMAGE_IDS.WEAVIATE),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.CHROMA}`,
    name: "Chroma Embedding Database Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CHROMA) || ctx.image.toLowerCase().includes(IMAGE_IDS.CHROMA),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },

  {
    id: `rule-strategy-${IMAGE_IDS.KAFKA}`,
    name: "Apache Kafka Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KAFKA) || ctx.image.toLowerCase().includes(IMAGE_IDS.KAFKA),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(stderr && !stdout && (stderr.includes("ConnectionRefusedException") || stderr.includes("Exception")));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.TEMPO}`,
    name: "Grafana Tempo Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("tempo") || ctx.image.toLowerCase().includes("tempo"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.LOKI}`,
    name: "Grafana Loki Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("loki") || ctx.image.toLowerCase().includes("loki"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.GRAFANA}`,
    name: "Grafana Strategy",
    priority: RULE_PRIORITIES.CRITICAL - 5,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.GRAFANA) || ctx.image.toLowerCase().includes(IMAGE_IDS.GRAFANA),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.PROMETHEUS}`,
    name: "Prometheus Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.PROMETHEUS) || ctx.image.toLowerCase().includes(IMAGE_IDS.PROMETHEUS),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.ELASTICSEARCH}`,
    name: "Elasticsearch Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("elastic") || ctx.image.toLowerCase().includes("elastic"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isError = Boolean(combined.includes('"status":400') || combined.includes('"status":500') || (stderr && !stdout));
      return { stdout, stderr, isErrorExit: isError, output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.VAULT}`,
    name: "HashiCorp Vault Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.VAULT) || ctx.image.toLowerCase().includes(IMAGE_IDS.VAULT),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && (stderr.includes("Vault is sealed") || stderr.includes("Error reading"))), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.KEYCLOAK}`,
    name: "Keycloak IAM Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KEYCLOAK) || ctx.image.toLowerCase().includes(IMAGE_IDS.KEYCLOAK),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.ORY_KRATOS}`,
    name: "Ory Kratos Distroless Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kratos") || ctx.image.toLowerCase().includes("kratos"),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: `rule-strategy-${IMAGE_IDS.LOCALSTACK}`,
    name: "LocalStack Cloud Strategy",
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.LOCALSTACK) || ctx.image.toLowerCase().includes(IMAGE_IDS.LOCALSTACK),
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${JSON.stringify(finalCmd)}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      return { stdout, stderr, isErrorExit: Boolean(stderr && !stdout), output: combined || "(Command executed with no output)" };
    },
  },

  {
    id: "rule-strategy-standard-shell",
    name: "Standard Shell Execution Strategy with Fallback",
    priority: RULE_PRIORITIES.FALLBACK,
    enabled: true,
    condition: () => true,
    execute: async (_ctx, containerId, finalCmd) => {
      const jsonCmd = JSON.stringify(finalCmd);
      let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${jsonCmd}`, 25000);

      if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
        const retryRes = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
        stdout = retryRes.stdout;
        stderr = retryRes.stderr;
      }

      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isErrorExit = Boolean(
        stderr &&
        !stdout &&
        (stderr.includes("Error:") || stderr.includes("No such container") || stderr.includes("command not found"))
      );

      return { stdout, stderr, isErrorExit, output: combined || "(Command executed with no output)" };
    },
  },
];

export async function resolveExecutionStrategy(
  rules: ExecutionStrategyRule[],
  ctx: RuleContext,
  containerId: string,
  finalCmd: string
): Promise<ExecutionStrategyResult> {
  const active = rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
  for (const rule of active) {
    if (rule.condition(ctx)) {
      return await rule.execute(ctx, containerId, finalCmd);
    }
  }
  return dockerExecStrategyRules[dockerExecStrategyRules.length - 1].execute(ctx, containerId, finalCmd);
}
