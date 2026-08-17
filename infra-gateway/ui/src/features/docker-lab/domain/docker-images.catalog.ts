import type { DockerImage } from "./entities/docker-image.entity";

function createDefaultConfig(
  imageId: string,
  defaultTag: string,
  port: number,
  env: { key: string; value: string }[] = [],
  customVolumes: { hostPath: string; containerPath: string; mode: "rw" | "ro" }[] = []
): DockerImage["defaultConfig"] {
  return {
    imageId,
    tag: defaultTag,
    ports: port ? [{ hostPort: port, containerPort: port, protocol: "tcp" }] : [],
    envVars: env,
    volumes: customVolumes,
    network: { mode: "bridge" },
    replicas: 1,
    resources: { cpus: "1.0", memoryMb: 1024 },
    restartPolicy: "unless-stopped",
    labels: [{ key: "managed-by", value: "infra-gateway-docker-lab" }],
  };
}

export const DOCKER_IMAGES_CATALOG: DockerImage[] = [
  {
    id: "redis",
    name: "Redis Server",
    image: "redis",
    defaultTag: "7.2-alpine",
    category: "Databases",
    description: "In-memory data structure store used as database, cache, streaming engine, and message broker.",
    icon: "🔴",
    officialUrl: "https://hub.docker.com/_/redis",
    defaultConfig: createDefaultConfig("redis", "7.2-alpine", 6379),
    healthProbe: { type: "tcp", port: 6379 }
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    image: "postgres",
    defaultTag: "16-alpine",
    category: "Databases",
    description: "Powerful, open source object-relational database system.",
    icon: "🐘",
    officialUrl: "https://hub.docker.com/_/postgres",
    defaultConfig: createDefaultConfig("postgres", "16-alpine", 5432, [
      { key: "POSTGRES_USER", value: "postgres" },
      { key: "POSTGRES_PASSWORD", value: "postgres" },
      { key: "POSTGRES_DB", value: "testdb" }
    ]),
    healthProbe: { type: "tcp", port: 5432 }
  },
  {
    id: "mysql",
    name: "MySQL Server",
    image: "mysql",
    defaultTag: "8.3",
    category: "Databases",
    description: "World's most popular open source relational database management system.",
    icon: "🐬",
    officialUrl: "https://hub.docker.com/_/mysql",
    defaultConfig: createDefaultConfig("mysql", "8.3", 3306, [
      { key: "MYSQL_ROOT_PASSWORD", value: "rootpass" },
      { key: "MYSQL_DATABASE", value: "testdb" }
    ]),
    healthProbe: { type: "tcp", port: 3306 }
  },
  {
    id: "mariadb",
    name: "MariaDB",
    image: "mariadb",
    defaultTag: "11-lts",
    category: "Databases",
    description: "Fast, scalable open-source relational database created by original MySQL developers.",
    icon: "🦭",
    officialUrl: "https://hub.docker.com/_/mariadb",
    defaultConfig: createDefaultConfig("mariadb", "11-lts", 3306, [
      { key: "MARIADB_ROOT_PASSWORD", value: "rootpass" }
    ]),
    healthProbe: { type: "tcp", port: 3306 }
  },
  {
    id: "mongodb",
    name: "MongoDB",
    image: "mongo",
    defaultTag: "7.0",
    category: "Databases",
    description: "Document-based distributed database designed for modern applications.",
    icon: "🍃",
    officialUrl: "https://hub.docker.com/_/mongo",
    defaultConfig: createDefaultConfig("mongodb", "7.0", 27017, [
      { key: "MONGO_INITDB_ROOT_USERNAME", value: "admin" },
      { key: "MONGO_INITDB_ROOT_PASSWORD", value: "adminpass" }
    ]),
    healthProbe: { type: "tcp", port: 27017 }
  },
  {
    id: "influxdb",
    name: "InfluxDB",
    image: "influxdb",
    defaultTag: "2.7-alpine",
    category: "Databases",
    description: "High-performance time-series database designed for metrics and events.",
    icon: "📈",
    officialUrl: "https://hub.docker.com/_/influxdb",
    defaultConfig: createDefaultConfig("influxdb", "2.7-alpine", 8086),
    healthProbe: { type: "http", port: 8086, path: "/health" }
  },
  {
    id: "cassandra",
    name: "Apache Cassandra",
    image: "cassandra",
    defaultTag: "5.0",
    category: "Databases",
    description: "Free and open-source distributed NoSQL database management system.",
    icon: "👁️",
    officialUrl: "https://hub.docker.com/_/cassandra",
    defaultConfig: createDefaultConfig("cassandra", "5.0", 9042),
    healthProbe: { type: "tcp", port: 9042 }
  },
  {
    id: "cockroachdb",
    name: "CockroachDB",
    image: "cockroachdb/cockroach",
    defaultTag: "v23.2.3",
    category: "Databases",
    description: "Cloud-native, distributed SQL database built on a transactional store.",
    icon: "🪲",
    officialUrl: "https://hub.docker.com/r/cockroachdb/cockroach",
    defaultConfig: createDefaultConfig("cockroachdb", "v23.2.3", 26257),
    healthProbe: { type: "http", port: 8080, path: "/health?ready=1" }
  },
  {
    id: "timescaledb",
    name: "TimescaleDB",
    image: "timescale/timescaledb",
    defaultTag: "latest-pg16",
    category: "Databases",
    description: "An open-source time-series SQL database powered by PostgreSQL.",
    icon: "⏱️",
    officialUrl: "https://hub.docker.com/r/timescale/timescaledb",
    defaultConfig: createDefaultConfig("timescaledb", "latest-pg16", 5432, [
      { key: "POSTGRES_USER", value: "postgres" },
      { key: "POSTGRES_PASSWORD", value: "postgres" }
    ]),
    healthProbe: { type: "tcp", port: 5432 }
  },
  {
    id: "scylladb",
    name: "ScyllaDB",
    image: "scylladb/scylla",
    defaultTag: "5.4",
    category: "Databases",
    description: "C++ implementation of Apache Cassandra with ultra-low latency.",
    icon: "🦎",
    officialUrl: "https://hub.docker.com/r/scylladb/scylla",
    defaultConfig: createDefaultConfig("scylladb", "5.4", 9042),
    healthProbe: { type: "tcp", port: 9042 }
  },
  {
    id: "surrealdb",
    name: "SurrealDB",
    image: "surrealdb/surrealdb",
    defaultTag: "latest",
    category: "Databases",
    description: "Multi-model database for web, mobile, serverless, edge, and cloud apps.",
    icon: "🌀",
    officialUrl: "https://hub.docker.com/r/surrealdb/surrealdb",
    defaultConfig: createDefaultConfig("surrealdb", "latest", 8000),
    healthProbe: { type: "http", port: 8000, path: "/health" }
  },
  {
    id: "neo4j",
    name: "Neo4j Graph DB",
    image: "neo4j",
    defaultTag: "5.18",
    category: "Databases",
    description: "Leading graph database management system designed for connected data.",
    icon: "🕸️",
    officialUrl: "https://hub.docker.com/_/neo4j",
    defaultConfig: createDefaultConfig("neo4j", "5.18", 7474, [
      { key: "NEO4J_AUTH", value: "neo4j/testpassword" }
    ]),
    healthProbe: { type: "http", port: 7474 }
  },

  {
    id: "kafka",
    name: "Apache Kafka",
    image: "apache/kafka",
    defaultTag: "3.7.0",
    category: "Messaging",
    description: "Distributed event streaming platform in KRaft single-node mode.",
    icon: "⚡",
    officialUrl: "https://hub.docker.com/r/apache/kafka",
    defaultConfig: createDefaultConfig("kafka", "3.7.0", 9092, [
      { key: "KAFKA_NODE_ID", value: "1" },
      { key: "KAFKA_PROCESS_ROLES", value: "broker,controller" },
      { key: "KAFKA_LISTENERS", value: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093" },
      { key: "KAFKA_ADVERTISED_LISTENERS", value: "PLAINTEXT://localhost:9092" },
      { key: "KAFKA_CONTROLLER_QUORUM_VOTERS", value: "1@localhost:9093" },
      { key: "KAFKA_LISTEN_SECURITY_PROTOCOL_MAP", value: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT" },
      { key: "KAFKA_CONTROLLER_LISTENER_NAMES", value: "CONTROLLER" },
      { key: "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR", value: "1" },
      { key: "CLUSTER_ID", value: "MkU3OEVBNTcwNTJENDM2Qk" }
    ]),
    healthProbe: { type: "tcp", port: 9092 }
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    image: "rabbitmq",
    defaultTag: "3.13-management-alpine",
    category: "Messaging",
    description: "Most widely deployed open source message broker with management console.",
    icon: "🐇",
    officialUrl: "https://hub.docker.com/_/rabbitmq",
    defaultConfig: createDefaultConfig("rabbitmq", "3.13-management-alpine", 5672, [
      { key: "RABBITMQ_DEFAULT_USER", value: "guest" },
      { key: "RABBITMQ_DEFAULT_PASS", value: "guest" }
    ]),
    healthProbe: { type: "http", port: 15672 }
  },
  {
    id: "nats",
    name: "NATS Server",
    image: "nats",
    defaultTag: "2.10-alpine",
    category: "Messaging",
    description: "Connective technology for modern cloud native distributed systems.",
    icon: "🚀",
    officialUrl: "https://hub.docker.com/_/nats",
    defaultConfig: createDefaultConfig("nats", "2.10-alpine", 4222),
    healthProbe: { type: "http", port: 8222, path: "/varz" }
  },
  {
    id: "pulsar",
    name: "Apache Pulsar",
    image: "apachepulsar/pulsar",
    defaultTag: "3.2.2",
    category: "Messaging",
    description: "All-in-one distributed messaging and streaming platform.",
    icon: "💫",
    officialUrl: "https://hub.docker.com/r/apachepulsar/pulsar",
    defaultConfig: createDefaultConfig("pulsar", "3.2.2", 6650),
    healthProbe: { type: "http", port: 8080, path: "/admin/v2/brokers/health" }
  },
  {
    id: "zookeeper",
    name: "Apache ZooKeeper",
    image: "zookeeper",
    defaultTag: "3.9-alpine",
    category: "Messaging",
    description: "Centralized service for maintaining configuration information and naming.",
    icon: "🦧",
    officialUrl: "https://hub.docker.com/_/zookeeper",
    defaultConfig: createDefaultConfig("zookeeper", "3.9-alpine", 2181),
    healthProbe: { type: "tcp", port: 2181 }
  },
  {
    id: "schema-registry",
    name: "Confluent Schema Registry",
    image: "confluentinc/cp-schema-registry",
    defaultTag: "7.6.0",
    category: "Messaging",
    description: "Serves as a central repository for schema management and compatibility enforcement.",
    icon: "📜",
    officialUrl: "https://hub.docker.com/r/confluentinc/cp-schema-registry",
    defaultConfig: createDefaultConfig("schema-registry", "7.6.0", 8081, [
      { key: "SCHEMA_REGISTRY_HOST_NAME", value: "schema-registry" },
      { key: "SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS", value: "kafka:9092" },
      { key: "SCHEMA_REGISTRY_LISTENERS", value: "http://0.0.0.0:8081" }
    ]),
    healthProbe: { type: "http", port: 8081 }
  },
  {
    id: "kafka-ui",
    name: "Kafka UI",
    image: "provectuslabs/kafka-ui",
    defaultTag: "latest",
    category: "Messaging",
    description: "Open-source web UI for Apache Kafka clusters management.",
    icon: "🖥️",
    officialUrl: "https://hub.docker.com/r/provectuslabs/kafka-ui",
    defaultConfig: createDefaultConfig("kafka-ui", "latest", 8080, [
      { key: "KAFKA_CLUSTERS_0_NAME", value: "local-cluster" },
      { key: "KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS", value: "kafka:9092" }
    ]),
    healthProbe: { type: "http", port: 8080, path: "/actuator/health" }
  },
  {
    id: "mosquitto",
    name: "Eclipse Mosquitto (MQTT)",
    image: "eclipse-mosquitto",
    defaultTag: "2.0",
    category: "Messaging",
    description: "An open source MQTT broker suitable for Internet of Things messaging.",
    icon: "🦟",
    officialUrl: "https://hub.docker.com/_/eclipse-mosquitto",
    defaultConfig: createDefaultConfig("mosquitto", "2.0", 1883),
    healthProbe: { type: "tcp", port: 1883 }
  },

  {
    id: "grafana",
    name: "Grafana Dashboards",
    image: "grafana/grafana",
    defaultTag: "10.4.0",
    category: "Observability",
    description: "The open and composable observability and data visualization platform.",
    icon: "📊",
    officialUrl: "https://hub.docker.com/r/grafana/grafana",
    defaultConfig: createDefaultConfig("grafana", "10.4.0", 3000, [
      { key: "GF_SECURITY_ADMIN_PASSWORD", value: "admin" }
    ]),
    healthProbe: { type: "http", port: 3000, path: "/api/health" }
  },
  {
    id: "prometheus",
    name: "Prometheus Monitoring",
    image: "prom/prometheus",
    defaultTag: "v2.51.0",
    category: "Observability",
    description: "Systems monitoring and alerting toolkit designed for reliability.",
    icon: "🔥",
    officialUrl: "https://hub.docker.com/r/prom/prometheus",
    defaultConfig: createDefaultConfig("prometheus", "v2.51.0", 9090),
    healthProbe: { type: "http", port: 9090, path: "/-/healthy" }
  },
  {
    id: "jaeger",
    name: "Jaeger Tracing",
    image: "jaegertracing/all-in-one",
    defaultTag: "1.56",
    category: "Observability",
    description: "End-to-end distributed tracing for monitoring complex cloud-native systems.",
    icon: "🏹",
    officialUrl: "https://hub.docker.com/r/jaegertracing/all-in-one",
    defaultConfig: createDefaultConfig("jaeger", "1.56", 16686),
    healthProbe: { type: "http", port: 16686 }
  },
  {
    id: "tempo",
    name: "Grafana Tempo",
    image: "grafana/tempo",
    defaultTag: "2.4.0",
    category: "Observability",
    description: "High-scale, easy-to-use and cost-effective distributed tracing backend.",
    icon: "⏳",
    officialUrl: "https://hub.docker.com/r/grafana/tempo",
    defaultConfig: createDefaultConfig("tempo", "2.4.0", 3200),
    healthProbe: { type: "http", port: 3200, path: "/ready" }
  },
  {
    id: "loki",
    name: "Grafana Loki",
    image: "grafana/loki",
    defaultTag: "3.0.0",
    category: "Observability",
    description: "Like Prometheus, but for logs. Designed to be cost effective and easy to operate.",
    icon: "🌲",
    officialUrl: "https://hub.docker.com/r/grafana/loki",
    defaultConfig: createDefaultConfig("loki", "3.0.0", 3100),
    healthProbe: { type: "http", port: 3100, path: "/ready" }
  },
  {
    id: "opentelemetry-collector",
    name: "OpenTelemetry Collector",
    image: "otel/opentelemetry-collector-contrib",
    defaultTag: "0.98.0",
    category: "Observability",
    description: "Vendor-agnostic telemetry data collector for metrics, logs, and traces.",
    icon: "📡",
    officialUrl: "https://hub.docker.com/r/otel/opentelemetry-collector-contrib",
    defaultConfig: createDefaultConfig("opentelemetry-collector", "0.98.0", 4317),
    healthProbe: { type: "http", port: 13133 }
  },
  {
    id: "zipkin",
    name: "Zipkin Distributed Tracing",
    image: "openzipkin/zipkin",
    defaultTag: "3.1",
    category: "Observability",
    description: "Distributed tracing system that gathers timing data needed to troubleshoot latency issues.",
    icon: "📌",
    officialUrl: "https://hub.docker.com/r/openzipkin/zipkin",
    defaultConfig: createDefaultConfig("zipkin", "3.1", 9411),
    healthProbe: { type: "http", port: 9411, path: "/health" }
  },
  {
    id: "alertmanager",
    name: "Prometheus Alertmanager",
    image: "prom/alertmanager",
    defaultTag: "v0.27.0",
    category: "Observability",
    description: "Handles alerts sent by client applications such as Prometheus server.",
    icon: "🚨",
    officialUrl: "https://hub.docker.com/r/prom/alertmanager",
    defaultConfig: createDefaultConfig("alertmanager", "v0.27.0", 9093),
    healthProbe: { type: "http", port: 9093, path: "/-/healthy" }
  },
  {
    id: "vector",
    name: "Datadog Vector Log Pipeline",
    image: "timberio/vector",
    defaultTag: "0.37.X-alpine",
    category: "Observability",
    description: "Ultra-fast, open-source tool for building observability data pipelines.",
    icon: "🧭",
    officialUrl: "https://hub.docker.com/r/timberio/vector",
    defaultConfig: createDefaultConfig("vector", "0.37.X-alpine", 8686),
    healthProbe: { type: "http", port: 8686, path: "/health" }
  },

  {
    id: "elasticsearch",
    name: "Elasticsearch",
    image: "docker.elastic.co/elasticsearch/elasticsearch",
    defaultTag: "8.13.0",
    category: "Search",
    description: "Distributed, RESTful search and analytics engine.",
    icon: "🔎",
    officialUrl: "https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html",
    defaultConfig: createDefaultConfig("elasticsearch", "8.13.0", 9200, [
      { key: "discovery.type", value: "single-node" },
      { key: "xpack.security.enabled", value: "false" }
    ]),
    healthProbe: { type: "http", port: 9200, path: "/_cluster/health" }
  },
  {
    id: "kibana",
    name: "Kibana Dashboard",
    image: "docker.elastic.co/kibana/kibana",
    defaultTag: "8.13.0",
    category: "Search",
    description: "Your window into the Elastic Stack for visualizing data and managing cluster.",
    icon: "👁️‍🗨️",
    officialUrl: "https://www.elastic.co/guide/en/kibana/current/docker.html",
    defaultConfig: createDefaultConfig("kibana", "8.13.0", 5601, [
      { key: "ELASTICSEARCH_HOSTS", value: "http://elasticsearch:9200" }
    ]),
    healthProbe: { type: "http", port: 5601, path: "/api/status" }
  },
  {
    id: "opensearch",
    name: "OpenSearch",
    image: "opensearchproject/opensearch",
    defaultTag: "2.13.0",
    category: "Search",
    description: "Community-driven, open source search and analytics suite derived from Elasticsearch.",
    icon: "🔍",
    officialUrl: "https://hub.docker.com/r/opensearchproject/opensearch",
    defaultConfig: createDefaultConfig("opensearch", "2.13.0", 9200, [
      { key: "discovery.type", value: "single-node" },
      { key: "DISABLE_SECURITY_PLUGIN", value: "true" }
    ]),
    healthProbe: { type: "http", port: 9200 }
  },
  {
    id: "meilisearch",
    name: "Meilisearch",
    image: "getmeili/meilisearch",
    defaultTag: "v1.7",
    category: "Search",
    description: "Lightning-fast, hyper-relevant search engine designed for web & mobile apps.",
    icon: "⚡",
    officialUrl: "https://hub.docker.com/r/getmeili/meilisearch",
    defaultConfig: createDefaultConfig("meilisearch", "v1.7", 7700),
    healthProbe: { type: "http", port: 7700, path: "/health" }
  },
  {
    id: "typesense",
    name: "Typesense",
    image: "typesense/typesense",
    defaultTag: "26.0",
    category: "Search",
    description: "Open source, typo-tolerant search engine optimized for fast developer experience.",
    icon: "💡",
    officialUrl: "https://hub.docker.com/r/typesense/typesense",
    defaultConfig: createDefaultConfig("typesense", "26.0", 8108, [
      { key: "TYPESENSE_API_KEY", value: "xyz" },
      { key: "TYPESENSE_DATA_DIR", value: "/tmp/typesense-data" }
    ]),
    healthProbe: { type: "http", port: 8108, path: "/health" }
  },

  {
    id: "nginx",
    name: "Nginx Reverse Proxy",
    image: "nginx",
    defaultTag: "mainline-alpine",
    category: "Proxy & Gateway",
    description: "High-performance HTTP server and reverse proxy.",
    icon: "🌐",
    officialUrl: "https://hub.docker.com/_/nginx",
    defaultConfig: createDefaultConfig("nginx", "mainline-alpine", 80),
    healthProbe: { type: "http", port: 80 }
  },
  {
    id: "traefik",
    name: "Traefik Proxy",
    image: "traefik",
    defaultTag: "v3.0",
    category: "Proxy & Gateway",
    description: "The Cloud Native Application Proxy for modern infrastructure.",
    icon: "🚏",
    officialUrl: "https://hub.docker.com/_/traefik",
    defaultConfig: createDefaultConfig("traefik", "v3.0", 8080),
    healthProbe: { type: "http", port: 8080, path: "/ping" }
  },
  {
    id: "envoy",
    name: "Envoy Proxy",
    image: "envoyproxy/envoy",
    defaultTag: "v1.29-latest",
    category: "Proxy & Gateway",
    description: "Open source edge and service proxy designed for cloud-native applications.",
    icon: "🛡️",
    officialUrl: "https://hub.docker.com/r/envoyproxy/envoy",
    defaultConfig: createDefaultConfig("envoy", "v1.29-latest", 10000),
    healthProbe: { type: "http", port: 9901, path: "/ready" }
  },
  {
    id: "haproxy",
    name: "HAProxy",
    image: "haproxy",
    defaultTag: "3.0-alpine",
    category: "Proxy & Gateway",
    description: "Reliable, high-performance TCP/HTTP load balancer.",
    icon: "⚖️",
    officialUrl: "https://hub.docker.com/_/haproxy",
    defaultConfig: createDefaultConfig("haproxy", "3.0-alpine", 80),
    healthProbe: { type: "tcp", port: 80 }
  },
  {
    id: "caddy",
    name: "Caddy Web Server",
    image: "caddy",
    defaultTag: "2.7-alpine",
    category: "Proxy & Gateway",
    description: "Enterprise-ready web server with automatic HTTPS.",
    icon: "🔒",
    officialUrl: "https://hub.docker.com/_/caddy",
    defaultConfig: createDefaultConfig("caddy", "2.7-alpine", 80),
    healthProbe: { type: "http", port: 80 }
  },
  {
    id: "kong",
    name: "Kong API Gateway",
    image: "kong",
    defaultTag: "3.6-alpine",
    category: "Proxy & Gateway",
    description: "Cloud-native API gateway built on top of Nginx.",
    icon: "🦍",
    officialUrl: "https://hub.docker.com/_/kong",
    defaultConfig: createDefaultConfig("kong", "3.6-alpine", 8000, [
      { key: "KONG_DATABASE", value: "off" }
    ]),
    healthProbe: { type: "http", port: 8001, path: "/status" }
  },

  {
    id: "vault",
    name: "HashiCorp Vault",
    image: "hashicorp/vault",
    defaultTag: "1.16",
    category: "Security & Auth",
    description: "Manage secrets, encrypt sensitive data, and secure infrastructure identity.",
    icon: "🔐",
    officialUrl: "https://hub.docker.com/r/hashicorp/vault",
    defaultConfig: createDefaultConfig("vault", "1.16", 8200, [
      { key: "VAULT_DEV_ROOT_TOKEN_ID", value: "root" }
    ]),
    healthProbe: { type: "http", port: 8200, path: "/v1/sys/health" }
  },
  {
    id: "keycloak",
    name: "Keycloak Identity IAM",
    image: "quay.io/keycloak/keycloak",
    defaultTag: "24.0",
    category: "Security & Auth",
    description: "Open source Identity and Access Management solution for modern applications.",
    icon: "🔑",
    officialUrl: "https://quay.io/repository/keycloak/keycloak",
    defaultConfig: createDefaultConfig("keycloak", "24.0", 8080, [
      { key: "KEYCLOAK_ADMIN", value: "admin" },
      { key: "KEYCLOAK_ADMIN_PASSWORD", value: "admin" }
    ]),
    healthProbe: { type: "http", port: 8080, path: "/health/ready" }
  },
  {
    id: "ory-kratos",
    name: "Ory Kratos IAM",
    image: "oryd/kratos",
    defaultTag: "v1.1.0",
    category: "Security & Auth",
    description: "First-class cloud native identity management system.",
    icon: "🧅",
    officialUrl: "https://hub.docker.com/r/oryd/kratos",
    defaultConfig: createDefaultConfig("ory-kratos", "v1.1.0", 4433),
    healthProbe: { type: "http", port: 4434, path: "/health/ready" }
  },

  {
    id: "minio",
    name: "MinIO Object Storage",
    image: "minio/minio",
    defaultTag: "RELEASE.2024-03-30T09-41-56Z",
    category: "CI/CD & Infra",
    description: "High-performance S3 compatible object storage system.",
    icon: "🪣",
    officialUrl: "https://hub.docker.com/r/minio/minio",
    defaultConfig: createDefaultConfig("minio", "RELEASE.2024-03-30T09-41-56Z", 9000, [
      { key: "MINIO_ROOT_USER", value: "minioadmin" },
      { key: "MINIO_ROOT_PASSWORD", value: "minioadmin" }
    ]),
    healthProbe: { type: "http", port: 9000, path: "/minio/health/live" }
  },
  {
    id: "jenkins",
    name: "Jenkins CI/CD",
    image: "jenkins/jenkins",
    defaultTag: "lts-alpine",
    category: "CI/CD & Infra",
    description: "Leading open source automation server for building and deploying software.",
    icon: "👨‍🍳",
    officialUrl: "https://hub.docker.com/r/jenkins/jenkins",
    defaultConfig: createDefaultConfig("jenkins", "lts-alpine", 8080),
    healthProbe: { type: "http", port: 8080, path: "/login" }
  },
  {
    id: "consul",
    name: "HashiCorp Consul",
    image: "hashicorp/consul",
    defaultTag: "1.18",
    category: "CI/CD & Infra",
    description: "Service networking platform for automated service discovery and service mesh.",
    icon: "🧭",
    officialUrl: "https://hub.docker.com/r/hashicorp/consul",
    defaultConfig: createDefaultConfig("consul", "1.18", 8500),
    healthProbe: { type: "http", port: 8500, path: "/v1/status/leader" }
  },
  {
    id: "etcd",
    name: "CoreOS etcd",
    image: "quay.io/coreos/etcd",
    defaultTag: "v3.5.13",
    category: "CI/CD & Infra",
    description: "Distributed, reliable key-value store for critical data of a distributed system.",
    icon: "🟩",
    officialUrl: "https://quay.io/repository/coreos/etcd",
    defaultConfig: createDefaultConfig("etcd", "v3.5.13", 2379),
    healthProbe: { type: "http", port: 2379, path: "/health" }
  }
];
