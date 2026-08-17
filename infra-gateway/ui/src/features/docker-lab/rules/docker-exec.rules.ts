import type { Rule } from "@/core/rules-engine/rule.types";

export const dockerExecRules: Rule[] = [
  {
    id: "rule-redis",
    name: "Redis Server CLI Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("redis") || ctx.image.toLowerCase().includes("redis"),
    transform: (ctx) => {
      const isCmd = /^(ping|set|get|keys|info|dbsize|hgetall|del|exists|type|flushall|flushdb)\b/i.test(ctx.codeLines);
      if (isCmd && !ctx.codeLines.toLowerCase().includes("redis-cli")) {
        return `PATH=$PATH:/usr/local/bin:/usr/bin redis-cli ${ctx.codeLines}`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: "rule-postgres",
    name: "PostgreSQL Database Query Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("postgres") || ctx.image.toLowerCase().includes("postgres"),
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
    id: "rule-mysql",
    name: "MySQL Server Query Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("mysql") || ctx.image.toLowerCase().includes("mysql"),
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
    id: "rule-mariadb",
    name: "MariaDB Server Query Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("mariadb") || ctx.image.toLowerCase().includes("mariadb"),
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
    id: "rule-mongodb",
    name: "MongoDB Document Database Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("mongo") || ctx.image.toLowerCase().includes("mongo"),
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
    id: "rule-clickhouse",
    name: "ClickHouse OLAP Database Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("clickhouse") || ctx.image.toLowerCase().includes("clickhouse"),
    transform: (ctx) => {
      if (ctx.isSql && !ctx.codeLines.toLowerCase().includes("clickhouse-client")) {
        return `PATH=$PATH:/usr/bin clickhouse-client -q ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: "rule-surrealdb",
    name: "SurrealDB Multi-Model Rule",
    category: "transform",
    priority: 100,
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
    id: "rule-cassandra",
    name: "Apache Cassandra CQLSH Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("cassandra") || ctx.image.toLowerCase().includes("cassandra"),
    transform: (ctx) => {
      if (ctx.isSql || ctx.codeLines.toLowerCase().startsWith("cqlsh")) {
        return `PATH=$PATH:/opt/cassandra/bin:/usr/local/bin cqlsh -e ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/opt/cassandra/bin:/usr/local/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: "rule-cockroachdb",
    name: "CockroachDB Distributed SQL Rule",
    category: "transform",
    priority: 100,
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
    id: "rule-timescaledb",
    name: "TimescaleDB Time-Series Postgres Rule",
    category: "transform",
    priority: 100,
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
    id: "rule-scylladb",
    name: "ScyllaDB Low Latency Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("scylla") || ctx.image.toLowerCase().includes("scylla"),
    transform: (ctx) => `PATH=$PATH:/usr/bin cqlsh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-influxdb",
    name: "InfluxDB Time Series Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("influxdb") || ctx.image.toLowerCase().includes("influxdb"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin:/usr/bin influx ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-neo4j",
    name: "Neo4j Graph Database Cypher Rule",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("neo4j") || ctx.image.toLowerCase().includes("neo4j"),
    transform: (ctx) => {
      if (ctx.codeLines.toLowerCase().startsWith("match") || ctx.codeLines.toLowerCase().startsWith("create")) {
        return `PATH=$PATH:/var/lib/neo4j/bin cypher-shell -u neo4j -p testpassword ${JSON.stringify(ctx.codeLines)}`;
      }
      return `PATH=$PATH:/var/lib/neo4j/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },

  {
    id: "rule-kafka",
    name: "Apache Kafka Event Streaming Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kafka") || ctx.image.toLowerCase().includes("kafka"),
    transform: (ctx) => {
      const cmd = ctx.codeLines.toLowerCase();
      if (cmd === "list-topics" || cmd === "topics" || cmd === "kafka-topics") {
        return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin kafka-topics.sh --bootstrap-server localhost:9092 --list`;
      }
      return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin:/usr/bin:/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: "rule-rabbitmq",
    name: "RabbitMQ Message Broker Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("rabbitmq") || ctx.image.toLowerCase().includes("rabbitmq"),
    transform: (ctx) => {
      const cmd = ctx.codeLines.toLowerCase();
      if (cmd === "status" || cmd === "queues" || cmd === "list-queues") {
        return `rabbitmqctl status || rabbitmqctl list_queues`;
      }
      return `PATH=$PATH:/usr/local/bin:/usr/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
  {
    id: "rule-pulsar",
    name: "Apache Pulsar Streaming Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("pulsar") || ctx.image.toLowerCase().includes("pulsar"),
    transform: (ctx) => `PATH=$PATH:/pulsar/bin pulsar-admin ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-nats",
    name: "NATS Cloud-Native Server Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("nats") || ctx.image.toLowerCase().includes("nats"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin nats-server ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-zookeeper",
    name: "Apache ZooKeeper Coordination Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("zookeeper") || ctx.image.toLowerCase().includes("zookeeper"),
    transform: (ctx) => `PATH=$PATH:/apache-zookeeper/bin:/usr/local/bin zkCli.sh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-schema-registry",
    name: "Confluent Schema Registry Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("schema-registry") || ctx.image.toLowerCase().includes("schema-registry"),
    transform: (ctx) => `curl -s http://localhost:8081/subjects || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-kafka-ui",
    name: "Kafka UI Management Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kafka-ui") || ctx.image.toLowerCase().includes("kafka-ui"),
    transform: (ctx) => `curl -s http://localhost:8080/actuator/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-mosquitto",
    name: "Eclipse Mosquitto MQTT Broker Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("mosquitto") || ctx.image.toLowerCase().includes("mosquitto"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin mosquitto_sub ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-grafana",
    name: "Grafana Dashboards Platform Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("grafana") || ctx.image.toLowerCase().includes("grafana"),
    transform: (ctx) => `PATH=$PATH:/usr/share/grafana/bin grafana-cli ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-prometheus",
    name: "Prometheus Monitoring Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("prometheus") || ctx.image.toLowerCase().includes("prometheus"),
    transform: (ctx) => `PATH=$PATH:/bin:/usr/local/bin promtool ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-jaeger",
    name: "Jaeger Tracing Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("jaeger") || ctx.image.toLowerCase().includes("jaeger"),
    transform: (ctx) => `curl -s http://localhost:16686 || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-tempo",
    name: "Grafana Tempo Tracing Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("tempo") || ctx.image.toLowerCase().includes("tempo"),
    transform: (ctx) => `curl -s http://localhost:3200/ready || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-loki",
    name: "Grafana Loki Logging Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("loki") || ctx.image.toLowerCase().includes("loki"),
    transform: (ctx) => `curl -s http://localhost:3100/ready || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-opentelemetry-collector",
    name: "OpenTelemetry Collector Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("otel") || ctx.image.toLowerCase().includes("otel"),
    transform: (ctx) => `PATH=$PATH:/ otelcol-contrib ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-zipkin",
    name: "Zipkin Distributed Tracing Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("zipkin") || ctx.image.toLowerCase().includes("zipkin"),
    transform: (ctx) => `curl -s http://localhost:9411/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-alertmanager",
    name: "Prometheus Alertmanager Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("alertmanager") || ctx.image.toLowerCase().includes("alertmanager"),
    transform: (ctx) => `PATH=$PATH:/bin alertmanager ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-vector",
    name: "Datadog Vector Pipeline Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("vector") || ctx.image.toLowerCase().includes("vector"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin vector ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-elasticsearch",
    name: "Elasticsearch Search Engine Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("elastic") || ctx.image.toLowerCase().includes("elasticsearch"),
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
    id: "rule-kibana",
    name: "Kibana Dashboard Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kibana") || ctx.image.toLowerCase().includes("kibana"),
    transform: (ctx) => `curl -s http://localhost:5601/api/status || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-opensearch",
    name: "OpenSearch Search Suite Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("opensearch") || ctx.image.toLowerCase().includes("opensearch"),
    transform: (ctx) => `curl -s http://localhost:9200 || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-meilisearch",
    name: "Meilisearch Search Engine Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("meilisearch") || ctx.image.toLowerCase().includes("meilisearch"),
    transform: (ctx) => `curl -s http://localhost:7700/health || ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-typesense",
    name: "Typesense Fast Search Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("typesense") || ctx.image.toLowerCase().includes("typesense"),
    transform: (ctx) => `curl -s http://localhost:8108/health || ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-nginx",
    name: "Nginx Web Server Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("nginx") || ctx.image.toLowerCase().includes("nginx"),
    transform: (ctx) => `PATH=$PATH:/usr/sbin:/usr/local/nginx/sbin nginx ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-traefik",
    name: "Traefik Cloud Native Proxy Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("traefik") || ctx.image.toLowerCase().includes("traefik"),
    transform: (ctx) => `PATH=$PATH:/ traefik ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-envoy",
    name: "Envoy Edge Proxy Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("envoy") || ctx.image.toLowerCase().includes("envoy"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin envoy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-haproxy",
    name: "HAProxy Load Balancer Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("haproxy") || ctx.image.toLowerCase().includes("haproxy"),
    transform: (ctx) => `PATH=$PATH:/usr/local/sbin haproxy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-caddy",
    name: "Caddy Web Server Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("caddy") || ctx.image.toLowerCase().includes("caddy"),
    transform: (ctx) => `PATH=$PATH:/usr/bin caddy ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-kong",
    name: "Kong API Gateway Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kong") || ctx.image.toLowerCase().includes("kong"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin kong ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-vault",
    name: "HashiCorp Vault Security Rule",
    category: "security",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("vault") || ctx.image.toLowerCase().includes("vault"),
    transform: (ctx) => `VAULT_ADDR='http://127.0.0.1:8200' PATH=$PATH:/usr/local/bin vault ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-keycloak",
    name: "Keycloak Identity IAM Rule",
    category: "security",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("keycloak") || ctx.image.toLowerCase().includes("keycloak"),
    transform: (ctx) => `/opt/keycloak/bin/kc.sh ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-ory-kratos",
    name: "Ory Kratos IAM Rule",
    category: "security",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("kratos") || ctx.image.toLowerCase().includes("kratos"),
    transform: (ctx) => `PATH=$PATH:/ kratos ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-minio",
    name: "MinIO Object Storage Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("minio") || ctx.image.toLowerCase().includes("minio"),
    transform: (ctx) => `PATH=$PATH:/opt/bin minio ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-jenkins",
    name: "Jenkins Automation Server Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("jenkins") || ctx.image.toLowerCase().includes("jenkins"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin jenkins-plugin-cli ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-consul",
    name: "HashiCorp Consul Service Mesh Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("consul") || ctx.image.toLowerCase().includes("consul"),
    transform: (ctx) => `PATH=$PATH:/bin consul ${ctx.codeLines || ctx.rawCommand}`,
  },
  {
    id: "rule-etcd",
    name: "CoreOS etcd Key-Value Store Rule",
    category: "routing",
    priority: 100,
    enabled: true,
    condition: (ctx) => ctx.containerName.toLowerCase().includes("etcd") || ctx.image.toLowerCase().includes("etcd"),
    transform: (ctx) => `PATH=$PATH:/usr/local/bin etcdctl ${ctx.codeLines || ctx.rawCommand}`,
  },

  {
    id: "rule-default-path-expansion",
    name: "Default Native Binary PATH Expansion Rule",
    category: "routing",
    priority: 10,
    enabled: true,
    condition: () => true,
    transform: (ctx) => {
      return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin:/usr/bin:/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
];
