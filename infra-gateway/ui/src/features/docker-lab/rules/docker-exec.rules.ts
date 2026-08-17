/**
 * Phase 1: Command Syntax Transformation Rules Engine (dockerExecRules)
 * 
 * ALGORITHM:
 * 1. Filter enabled rules (rule.enabled === true).
 * 2. Sort rules by rule.priority descending (100 -> 10).
 * 3. Evaluate rule.condition(ctx) against container image name and command.
 * 4. Transform raw user query into native CLI invocation (psql, mysql, mongosh, redis-cli, kafka-topics.sh, cqlsh, etc.).
 * 5. Inject container $PATH expansion to ensure native binaries are located regardless of base OS structure.
 */

import type { Rule } from "@/core/rules-engine/rule.types";
import { IMAGE_IDS, RULE_CATEGORIES, RULE_PRIORITIES, RULE_IDS } from "../constants/docker-lab.constants";

export const dockerExecRules: Rule[] = [

  {
    id: RULE_IDS[IMAGE_IDS.REDIS],
    name: "Redis Server CLI Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.REDIS) || ctx.image.toLowerCase().includes(IMAGE_IDS.REDIS),
    transform: (ctx) => {
      const isCmd = /^(ping|set|get|keys|info|dbsize|hgetall|del|exists|type|flushall|flushdb)\b/i.test(ctx.codeLines);
      if (isCmd && !ctx.codeLines.toLowerCase().includes("redis-cli")) {
        return `PATH=$PATH:/usr/local/bin:/usr/bin redis-cli ${ctx.codeLines}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.POSTGRES],
    name: "PostgreSQL Database Query Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.POSTGRES) || ctx.image.toLowerCase().includes(IMAGE_IDS.POSTGRES),
    transform: (ctx) => {
      const pgUser = ctx.env.POSTGRES_USER || "postgres";
      const pgDb = ctx.env.POSTGRES_DB || "postgres";
      if ((ctx.isSql || ctx.rawCommand.trim() === "psql") && !ctx.codeLines.toLowerCase().includes("psql")) {
        const sql = ctx.codeLines || "SELECT current_database(), current_user, version(), now();";
        return `PATH=$PATH:/usr/local/bin:/usr/bin psql -U ${pgUser} -d ${pgDb} -c ${JSON.stringify(sql)}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.MYSQL],
    name: "MySQL Server Query Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MYSQL) || ctx.image.toLowerCase().includes(IMAGE_IDS.MYSQL),
    transform: (ctx) => {
      const user = ctx.env.MYSQL_USER || "root";
      const pass = ctx.env.MYSQL_PASSWORD || ctx.env.MYSQL_ROOT_PASSWORD || "";
      const db = ctx.env.MYSQL_DATABASE || "";
      const passFlag = pass ? `-p"${pass}"` : "";
      if ((ctx.isSql || ctx.rawCommand.trim() === "mysql") && !ctx.codeLines.toLowerCase().includes("mysql")) {
        const sql = ctx.codeLines || "SHOW DATABASES;";
        return `PATH=$PATH:/usr/local/bin:/usr/bin mysql -u ${user} ${passFlag} ${db ? `"${db}"` : ""} -e ${JSON.stringify(sql)}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.MARIADB],
    name: "MariaDB Server Query Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MARIADB) || ctx.image.toLowerCase().includes(IMAGE_IDS.MARIADB),
    transform: (ctx) => {
      const user = ctx.env.MARIADB_USER || "root";
      const pass = ctx.env.MARIADB_ROOT_PASSWORD || ctx.env.MARIADB_PASSWORD || "";
      const db = ctx.env.MARIADB_DATABASE || "";
      const passFlag = pass ? `-p"${pass}"` : "";
      if (ctx.isSql && !ctx.codeLines.toLowerCase().includes("mariadb") && !ctx.codeLines.toLowerCase().includes("mysql")) {
        return `PATH=$PATH:/usr/local/bin:/usr/bin mariadb -u ${user} ${passFlag} ${db ? `"${db}"` : ""} -e ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.MONGODB],
    name: "MongoDB Document Database Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MONGODB) || ctx.image.toLowerCase().includes("mongo"),
    transform: (ctx) => {
      const user = ctx.env.MONGO_INITDB_ROOT_USERNAME || "";
      const pass = ctx.env.MONGO_INITDB_ROOT_PASSWORD || "";
      const auth = user ? `-u ${user} -p ${pass} --authenticationDatabase admin` : "";
      const lower = ctx.codeLines.toLowerCase();
      if (lower.startsWith("db.") || lower.startsWith("show ") || lower === "dbs") {
        const query = lower === "show dbs" || lower === "dbs" ? "show dbs" : ctx.codeLines;
        return `PATH=$PATH:/usr/local/bin:/usr/bin mongosh ${auth} --quiet --eval ${JSON.stringify(query)} || mongo ${auth} --quiet --eval ${JSON.stringify(query)}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.CLICKHOUSE],
    name: "ClickHouse OLAP Database Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CLICKHOUSE) || ctx.image.toLowerCase().includes("clickhouse"),
    transform: (ctx) => {
      if (ctx.isSql && !ctx.codeLines.toLowerCase().includes("clickhouse-client")) {
        return `PATH=$PATH:/usr/bin clickhouse-client -q ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.SURREALDB],
    name: "SurrealDB Multi-Model Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("surreal") || ctx.image.toLowerCase().includes("surreal"),
    transform: (ctx) => {
      if (ctx.isSql || ctx.codeLines.toLowerCase().startsWith("select") || ctx.codeLines.toLowerCase().startsWith("create")) {
        return `/surreal sql --endpoint http://localhost:8000 --user root --pass root --ns main --db main ${JSON.stringify(ctx.codeLines)}`;
      }
      return `/surreal ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.CASSANDRA],
    name: "Apache Cassandra CQLSH Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CASSANDRA) || ctx.image.toLowerCase().includes(IMAGE_IDS.CASSANDRA),
    transform: (ctx) => {
      if (ctx.isSql || ctx.codeLines.toLowerCase().startsWith("cqlsh")) {
        return `PATH=$PATH:/opt/cassandra/bin:/usr/local/bin cqlsh -e ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/opt/cassandra/bin:/usr/local/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.COCKROACHDB],
    name: "CockroachDB Distributed SQL Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("cockroach") || ctx.image.toLowerCase().includes("cockroach"),
    transform: (ctx) => {
      if (ctx.isSql) {
        return `PATH=$PATH:/cockroach:/usr/local/bin cockroach sql --insecure -e ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/cockroach:/usr/local/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.TIMESCALEDB],
    name: "TimescaleDB Time-Series Postgres Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("timescale") || ctx.image.toLowerCase().includes("timescale"),
    transform: (ctx) => {
      const pgUser = ctx.env.POSTGRES_USER || "postgres";
      const pgDb = ctx.env.POSTGRES_DB || "postgres";
      if (ctx.isSql) {
        return `PATH=$PATH:/usr/local/bin:/usr/bin psql -U ${pgUser} -d ${pgDb} -c ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.SCYLLADB],
    name: "ScyllaDB Low Latency Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("scylla") || ctx.image.toLowerCase().includes("scylla"),
    transform: (ctx) => `PATH=$PATH:/usr/bin cqlsh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.INFLUXDB],
    name: "InfluxDB Time Series Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.INFLUXDB) || ctx.image.toLowerCase().includes(IMAGE_IDS.INFLUXDB),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin:/usr/bin influx ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.NEO4J],
    name: "Neo4j Graph Database Cypher Rule",
    category: RULE_CATEGORIES.TRANSFORM,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.NEO4J) || ctx.image.toLowerCase().includes(IMAGE_IDS.NEO4J),
    transform: (ctx) => {
      if (ctx.codeLines.toLowerCase().startsWith("match") || ctx.codeLines.toLowerCase().startsWith("create")) {
        return `PATH=$PATH:/var/lib/neo4j/bin cypher-shell -u neo4j -p testpassword ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/var/lib/neo4j/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },

  {
    id: RULE_IDS[IMAGE_IDS.QDRANT],
    name: "Qdrant Vector Engine Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.QDRANT) || ctx.image.toLowerCase().includes(IMAGE_IDS.QDRANT),
    transform: (ctx) => `curl -s http://localhost:6333/readyz || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.MILVUS],
    name: "Milvus Vector Database Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MILVUS) || ctx.image.toLowerCase().includes(IMAGE_IDS.MILVUS),
    transform: (ctx) => `curl -s http://localhost:9091/healthz || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.WEAVIATE],
    name: "Weaviate Semantic Vector Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.WEAVIATE) || ctx.image.toLowerCase().includes(IMAGE_IDS.WEAVIATE),
    transform: (ctx) => `curl -s http://localhost:8080/v1/.well-known/ready || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.CHROMA],
    name: "Chroma Embedding Database Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CHROMA) || ctx.image.toLowerCase().includes(IMAGE_IDS.CHROMA),
    transform: (ctx) => `curl -s http://localhost:8000/api/v1/heartbeat || ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.KAFKA],
    name: "Apache Kafka Event Streaming Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KAFKA) || ctx.image.toLowerCase().includes(IMAGE_IDS.KAFKA),
    transform: (ctx) => {
      const cmd = ctx.codeLines.toLowerCase();
      if (cmd === "list-topics" || cmd === "topics" || cmd === "kafka-topics") {
        return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin kafka-topics.sh --bootstrap-server localhost:9092 --list`;
      }
      return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin:/usr/bin:/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.RABBITMQ],
    name: "RabbitMQ Message Broker Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.RABBITMQ) || ctx.image.toLowerCase().includes(IMAGE_IDS.RABBITMQ),
    transform: (ctx) => {
      const cmd = ctx.codeLines.toLowerCase();
      if (cmd === "status" || cmd === "queues" || cmd === "list-queues") {
        return `rabbitmqctl status || rabbitmqctl list_queues`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.PULSAR],
    name: "Apache Pulsar Streaming Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.PULSAR) || ctx.image.toLowerCase().includes(IMAGE_IDS.PULSAR),
    transform: (ctx) => `PATH=$PATH:/pulsar/bin pulsar-admin ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.NATS],
    name: "NATS Cloud-Native Server Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.NATS) || ctx.image.toLowerCase().includes(IMAGE_IDS.NATS),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin nats-server ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ZOOKEEPER],
    name: "Apache ZooKeeper Coordination Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.ZOOKEEPER) || ctx.image.toLowerCase().includes(IMAGE_IDS.ZOOKEEPER),
    transform: (ctx) => `PATH=$PATH:/apache-zookeeper/bin:/usr/local/bin zkCli.sh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.SCHEMA_REGISTRY],
    name: "Confluent Schema Registry Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("schema-registry") || ctx.image.toLowerCase().includes("schema-registry"),
    transform: (ctx) => `curl -s http://localhost:8081/subjects || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.KAFKA_UI],
    name: "Kafka UI Management Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kafka-ui") || ctx.image.toLowerCase().includes("kafka-ui"),
    transform: (ctx) => `curl -s http://localhost:8080/actuator/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.MOSQUITTO],
    name: "Eclipse Mosquitto MQTT Broker Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MOSQUITTO) || ctx.image.toLowerCase().includes(IMAGE_IDS.MOSQUITTO),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin mosquitto_sub ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.GRAFANA],
    name: "Grafana Dashboards Platform Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.GRAFANA) || ctx.image.toLowerCase().includes(IMAGE_IDS.GRAFANA),
    transform: (ctx) => `PATH=$PATH:/usr/share/grafana/bin grafana-cli ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.PROMETHEUS],
    name: "Prometheus Monitoring Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.PROMETHEUS) || ctx.image.toLowerCase().includes(IMAGE_IDS.PROMETHEUS),
    transform: (ctx) => `PATH=$PATH:/bin:/usr/local/bin promtool ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.JAEGER],
    name: "Jaeger Tracing Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.JAEGER) || ctx.image.toLowerCase().includes(IMAGE_IDS.JAEGER),
    transform: (ctx) => `curl -s http://localhost:16686 || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.TEMPO],
    name: "Grafana Tempo Tracing Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.TEMPO) || ctx.image.toLowerCase().includes(IMAGE_IDS.TEMPO),
    transform: (ctx) => `curl -s http://localhost:3200/ready || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.LOKI],
    name: "Grafana Loki Logging Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.LOKI) || ctx.image.toLowerCase().includes(IMAGE_IDS.LOKI),
    transform: (ctx) => `curl -s http://localhost:3100/ready || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.OPENTELEMETRY_COLLECTOR],
    name: "OpenTelemetry Collector Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("otel") || ctx.image.toLowerCase().includes("otel"),
    transform: (ctx) => `PATH=$PATH:/ otelcol-contrib ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ZIPKIN],
    name: "Zipkin Distributed Tracing Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.ZIPKIN) || ctx.image.toLowerCase().includes(IMAGE_IDS.ZIPKIN),
    transform: (ctx) => `curl -s http://localhost:9411/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ALERTMANAGER],
    name: "Prometheus Alertmanager Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.ALERTMANAGER) || ctx.image.toLowerCase().includes(IMAGE_IDS.ALERTMANAGER),
    transform: (ctx) => `PATH=$PATH:/bin alertmanager ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.VECTOR],
    name: "Datadog Vector Pipeline Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.VECTOR) || ctx.image.toLowerCase().includes(IMAGE_IDS.VECTOR),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin vector ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.ELASTICSEARCH],
    name: "Elasticsearch Search Engine Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("elastic") || ctx.image.toLowerCase().includes(IMAGE_IDS.ELASTICSEARCH),
    transform: (ctx) => {
      const cmd = ctx.codeLines.toLowerCase();
      if (cmd === "health" || cmd === "status" || cmd === "cluster") {
        return `curl -s http://localhost:9200/_cluster/health?pretty`;
      }
      if (cmd === "indices" || cmd === "cat indices") {
        return `curl -s http://localhost:9200/_cat/indices?v`;
      }
      return `PATH=$PATH:/usr/share/elasticsearch/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: RULE_IDS[IMAGE_IDS.KIBANA],
    name: "Kibana Dashboard Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KIBANA) || ctx.image.toLowerCase().includes(IMAGE_IDS.KIBANA),
    transform: (ctx) => `curl -s http://localhost:5601/api/status || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.OPENSEARCH],
    name: "OpenSearch Search Suite Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.OPENSEARCH) || ctx.image.toLowerCase().includes(IMAGE_IDS.OPENSEARCH),
    transform: (ctx) => `curl -s http://localhost:9200 || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.MEILISEARCH],
    name: "Meilisearch Search Engine Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MEILISEARCH) || ctx.image.toLowerCase().includes(IMAGE_IDS.MEILISEARCH),
    transform: (ctx) => `curl -s http://localhost:7700/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.TYPESENSE],
    name: "Typesense Fast Search Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.TYPESENSE) || ctx.image.toLowerCase().includes(IMAGE_IDS.TYPESENSE),
    transform: (ctx) => `curl -s http://localhost:8108/health || ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.NGINX],
    name: "Nginx Web Server Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.NGINX) || ctx.image.toLowerCase().includes(IMAGE_IDS.NGINX),
    transform: (ctx) => `PATH=$PATH:/usr/sbin:/usr/local/nginx/sbin nginx ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.TRAEFIK],
    name: "Traefik Cloud Native Proxy Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.TRAEFIK) || ctx.image.toLowerCase().includes(IMAGE_IDS.TRAEFIK),
    transform: (ctx) => `PATH=$PATH:/ traefik ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ENVOY],
    name: "Envoy Edge Proxy Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.ENVOY) || ctx.image.toLowerCase().includes(IMAGE_IDS.ENVOY),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin envoy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.HAPROXY],
    name: "HAProxy Load Balancer Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.HAPROXY) || ctx.image.toLowerCase().includes(IMAGE_IDS.HAPROXY),
    transform: (ctx) => `PATH=$PATH:/usr/local/sbin haproxy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.CADDY],
    name: "Caddy Web Server Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CADDY) || ctx.image.toLowerCase().includes(IMAGE_IDS.CADDY),
    transform: (ctx) => `PATH=$PATH:/usr/bin caddy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.KONG],
    name: "Kong API Gateway Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KONG) || ctx.image.toLowerCase().includes(IMAGE_IDS.KONG),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin kong ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.VAULT],
    name: "HashiCorp Vault Security Rule",
    category: RULE_CATEGORIES.SECURITY,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.VAULT) || ctx.image.toLowerCase().includes(IMAGE_IDS.VAULT),
    transform: (ctx) => `VAULT_ADDR='http://127.0.0.1:8200' PATH=$PATH:/usr/local/bin vault ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.KEYCLOAK],
    name: "Keycloak Identity IAM Rule",
    category: RULE_CATEGORIES.SECURITY,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.KEYCLOAK) || ctx.image.toLowerCase().includes(IMAGE_IDS.KEYCLOAK),
    transform: (ctx) => `/opt/keycloak/bin/kc.sh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ORY_KRATOS],
    name: "Ory Kratos IAM Rule",
    category: RULE_CATEGORIES.SECURITY,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kratos") || ctx.image.toLowerCase().includes("kratos"),
    transform: (ctx) => `PATH=$PATH:/ kratos ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: RULE_IDS[IMAGE_IDS.MINIO],
    name: "MinIO Object Storage Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.MINIO) || ctx.image.toLowerCase().includes(IMAGE_IDS.MINIO),
    transform: (ctx) => `PATH=$PATH:/opt/bin minio ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.JENKINS],
    name: "Jenkins Automation Server Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.JENKINS) || ctx.image.toLowerCase().includes(IMAGE_IDS.JENKINS),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin jenkins-plugin-cli ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.CONSUL],
    name: "HashiCorp Consul Service Mesh Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.CONSUL) || ctx.image.toLowerCase().includes(IMAGE_IDS.CONSUL),
    transform: (ctx) => `PATH=$PATH:/bin consul ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.ETCD],
    name: "CoreOS etcd Key-Value Store Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.ETCD) || ctx.image.toLowerCase().includes(IMAGE_IDS.ETCD),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin etcdctl ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: RULE_IDS[IMAGE_IDS.LOCALSTACK],
    name: "LocalStack Cloud AWS Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.CRITICAL,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes(IMAGE_IDS.LOCALSTACK) || ctx.image.toLowerCase().includes(IMAGE_IDS.LOCALSTACK),
    transform: (ctx) => {
      if (ctx.codeLines.startsWith("awslocal") || ctx.codeLines.startsWith("aws")) {
        return `awslocal ${ctx.codeLines.replace(/^awslocal\s*/, "").replace(/^aws\s*/, "")}`;
      }
      return `PATH=$PATH:/usr/local/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },

  {
    id: "rule-default-path-expansion",
    name: "Default Native Binary PATH Expansion Rule",
    category: RULE_CATEGORIES.ROUTING,
    priority: RULE_PRIORITIES.FALLBACK,
    enabled: true,
    condition: () => true,
    transform: (ctx) => {
      return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin:/usr/bin:/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
];
