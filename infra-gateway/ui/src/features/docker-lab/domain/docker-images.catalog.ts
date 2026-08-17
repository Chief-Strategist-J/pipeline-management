import type { DockerImage } from "./entities/docker-image.entity";
import { IMAGE_IDS, CATEGORIES, DOCKER_HUB_URLS } from "../constants/docker-lab.constants";

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
    id: IMAGE_IDS.REDIS,
    name: "Redis Server",
    image: "redis",
    defaultTag: "7.2-alpine",
    category: CATEGORIES.DATABASES,
    description: "In-memory data structure store used as database, cache, streaming engine, and message broker.",
    icon: "🔴",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.REDIS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.REDIS, "7.2-alpine", 6379),
    healthProbe: { type: "tcp", port: 6379 }
  },
  {
    id: IMAGE_IDS.POSTGRES,
    name: "PostgreSQL",
    image: "postgres",
    defaultTag: "16-alpine",
    category: CATEGORIES.DATABASES,
    description: "Powerful, open source object-relational database system.",
    icon: "🐘",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.POSTGRES],
    defaultConfig: createDefaultConfig(IMAGE_IDS.POSTGRES, "16-alpine", 5432, [
      { key: "POSTGRES_USER", value: "postgres" },
      { key: "POSTGRES_PASSWORD", value: "postgres" },
      { key: "POSTGRES_DB", value: "testdb" }
    ]),
    healthProbe: { type: "tcp", port: 5432 }
  },
  {
    id: IMAGE_IDS.MYSQL,
    name: "MySQL Server",
    image: "mysql",
    defaultTag: "8.3",
    category: CATEGORIES.DATABASES,
    description: "World's most popular open source relational database management system.",
    icon: "🐬",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MYSQL],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MYSQL, "8.3", 3306, [
      { key: "MYSQL_ROOT_PASSWORD", value: "rootpass" },
      { key: "MYSQL_DATABASE", value: "testdb" }
    ]),
    healthProbe: { type: "tcp", port: 3306 }
  },
  {
    id: IMAGE_IDS.MARIADB,
    name: "MariaDB Server",
    image: "mariadb",
    defaultTag: "11-lts",
    category: CATEGORIES.DATABASES,
    description: "Community-developed, commercially supported fork of the MySQL relational database.",
    icon: "🦭",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MARIADB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MARIADB, "11-lts", 3306, [
      { key: "MARIADB_ROOT_PASSWORD", value: "rootpass" },
      { key: "MARIADB_DATABASE", value: "testdb" }
    ]),
    healthProbe: { type: "tcp", port: 3306 }
  },
  {
    id: IMAGE_IDS.MONGODB,
    name: "MongoDB",
    image: "mongo",
    defaultTag: "7.0",
    category: CATEGORIES.DATABASES,
    description: "Document-based distributed database designed for modern applications.",
    icon: "🍃",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MONGODB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MONGODB, "7.0", 27017, [
      { key: "MONGO_INITDB_ROOT_USERNAME", value: "admin" },
      { key: "MONGO_INITDB_ROOT_PASSWORD", value: "adminpass" }
    ]),
    healthProbe: { type: "tcp", port: 27017 }
  },
  {
    id: IMAGE_IDS.INFLUXDB,
    name: "InfluxDB",
    image: "influxdb",
    defaultTag: "2.7-alpine",
    category: CATEGORIES.DATABASES,
    description: "High-performance time-series database designed for metrics and events.",
    icon: "📈",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.INFLUXDB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.INFLUXDB, "2.7-alpine", 8086),
    healthProbe: { type: "http", port: 8086, path: "/health" }
  },
  {
    id: IMAGE_IDS.CASSANDRA,
    name: "Apache Cassandra",
    image: "cassandra",
    defaultTag: "5.0",
    category: CATEGORIES.DATABASES,
    description: "Distributed NoSQL database designed to handle large amounts of data across many commodity servers.",
    icon: "👁️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.CASSANDRA],
    defaultConfig: createDefaultConfig(IMAGE_IDS.CASSANDRA, "5.0", 9042),
    healthProbe: { type: "tcp", port: 9042 }
  },
  {
    id: IMAGE_IDS.COCKROACHDB,
    name: "CockroachDB",
    image: "cockroachdb/cockroach",
    defaultTag: "v23.2.0",
    category: CATEGORIES.DATABASES,
    description: "Cloud-native, distributed SQL database built on a transactional key-value store.",
    icon: "🪳",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.COCKROACHDB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.COCKROACHDB, "v23.2.0", 26257),
    healthProbe: { type: "http", port: 8080, path: "/health?ready=1" }
  },
  {
    id: IMAGE_IDS.TIMESCALEDB,
    name: "TimescaleDB",
    image: "timescale/timescaledb",
    defaultTag: "latest-pg16",
    category: CATEGORIES.DATABASES,
    description: "Open-source time-series database optimized for fast ingest and complex queries built on PostgreSQL.",
    icon: "⏱️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.TIMESCALEDB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.TIMESCALEDB, "latest-pg16", 5432, [
      { key: "POSTGRES_PASSWORD", value: "password" }
    ]),
    healthProbe: { type: "tcp", port: 5432 }
  },
  {
    id: IMAGE_IDS.SCYLLADB,
    name: "ScyllaDB",
    image: "scylladb/scylla",
    defaultTag: "5.4.0",
    category: CATEGORIES.DATABASES,
    description: "Ultra-high performance, low-latency NoSQL database fully compatible with Apache Cassandra.",
    icon: "⚡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.SCYLLADB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.SCYLLADB, "5.4.0", 9042),
    healthProbe: { type: "tcp", port: 9042 }
  },
  {
    id: IMAGE_IDS.SURREALDB,
    name: "SurrealDB",
    image: "surrealdb/surrealdb",
    defaultTag: "v1.3.0",
    category: CATEGORIES.DATABASES,
    description: "Ultimate multi-model database for web, mobile, serverless, jamstack, and backend applications.",
    icon: "🌀",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.SURREALDB],
    defaultConfig: createDefaultConfig(IMAGE_IDS.SURREALDB, "v1.3.0", 8000),
    healthProbe: { type: "http", port: 8000, path: "/health" }
  },
  {
    id: IMAGE_IDS.CLICKHOUSE,
    name: "ClickHouse",
    image: "clickhouse/clickhouse-server",
    defaultTag: "24.3-alpine",
    category: CATEGORIES.DATABASES,
    description: "Fast open-source OLAP database management system for real-time analytics.",
    icon: "🏠",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.CLICKHOUSE],
    defaultConfig: createDefaultConfig(IMAGE_IDS.CLICKHOUSE, "24.3-alpine", 8123),
    healthProbe: { type: "http", port: 8123, path: "/ping" }
  },
  {
    id: IMAGE_IDS.NEO4J,
    name: "Neo4j",
    image: "neo4j",
    defaultTag: "5.18-community",
    category: CATEGORIES.DATABASES,
    description: "Leading graph database management system designed to derive insights from data relationships.",
    icon: "🕸️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.NEO4J],
    defaultConfig: createDefaultConfig(IMAGE_IDS.NEO4J, "5.18-community", 7474, [
      { key: "NEO4J_AUTH", value: "neo4j/testpassword" }
    ]),
    healthProbe: { type: "http", port: 7474 }
  },

  {
    id: IMAGE_IDS.QDRANT,
    name: "Qdrant Vector DB",
    image: "qdrant/qdrant",
    defaultTag: "v1.8.3",
    category: CATEGORIES.AI_VECTOR,
    description: "Vector similarity search engine and database for next-generation AI applications.",
    icon: "🎯",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.QDRANT],
    defaultConfig: createDefaultConfig(IMAGE_IDS.QDRANT, "v1.8.3", 6333),
    healthProbe: { type: "http", port: 6333, path: "/readyz" }
  },
  {
    id: IMAGE_IDS.MILVUS,
    name: "Milvus Vector DB",
    image: "milvusdb/milvus",
    defaultTag: "v2.3.10",
    category: CATEGORIES.AI_VECTOR,
    description: "Open-source vector database built to power AI applications and embeddings search.",
    icon: "📐",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MILVUS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MILVUS, "v2.3.10", 19530),
    healthProbe: { type: "http", port: 9091, path: "/healthz" }
  },
  {
    id: IMAGE_IDS.WEAVIATE,
    name: "Weaviate Vector DB",
    image: "semitechnologies/weaviate",
    defaultTag: "1.24.8",
    category: CATEGORIES.AI_VECTOR,
    description: "Cloud-native, open-source vector database designed for ML models and semantic search.",
    icon: "🧬",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.WEAVIATE],
    defaultConfig: createDefaultConfig(IMAGE_IDS.WEAVIATE, "1.24.8", 8080, [
      { key: "QUERY_DEFAULTS_LIMIT", value: "25" },
      { key: "AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED", value: "true" },
      { key: "PERSISTENCE_DATA_PATH", value: "/var/lib/weaviate" }
    ]),
    healthProbe: { type: "http", port: 8080, path: "/v1/.well-known/ready" }
  },
  {
    id: IMAGE_IDS.CHROMA,
    name: "Chroma Vector DB",
    image: "chromadb/chroma",
    defaultTag: "0.4.24",
    category: CATEGORIES.AI_VECTOR,
    description: "AI-native open-source embedding database for LLM apps.",
    icon: "🎨",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.CHROMA],
    defaultConfig: createDefaultConfig(IMAGE_IDS.CHROMA, "0.4.24", 8000),
    healthProbe: { type: "http", port: 8000, path: "/api/v1/heartbeat" }
  },

  {
    id: IMAGE_IDS.KAFKA,
    name: "Apache Kafka",
    image: "apache/kafka",
    defaultTag: "3.7.0",
    category: CATEGORIES.MESSAGING,
    description: "Distributed event streaming platform used for high-performance data pipelines and streaming analytics.",
    icon: "🚀",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.KAFKA],
    defaultConfig: createDefaultConfig(IMAGE_IDS.KAFKA, "3.7.0", 9092, [
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
    id: IMAGE_IDS.RABBITMQ,
    name: "RabbitMQ",
    image: "rabbitmq",
    defaultTag: "3.13-management-alpine",
    category: CATEGORIES.MESSAGING,
    description: "Most widely deployed open source message broker supporting AMQP, MQTT, and STOMP.",
    icon: "🐇",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.RABBITMQ],
    defaultConfig: createDefaultConfig(IMAGE_IDS.RABBITMQ, "3.13-management-alpine", 5672, [
      { key: "RABBITMQ_DEFAULT_USER", value: "guest" },
      { key: "RABBITMQ_DEFAULT_PASS", value: "guest" }
    ]),
    healthProbe: { type: "http", port: 15672, path: "/api/health/checks/alarms" }
  },
  {
    id: IMAGE_IDS.NATS,
    name: "NATS Server",
    image: "nats",
    defaultTag: "2.10-alpine",
    category: CATEGORIES.MESSAGING,
    description: "Simple, secure and high performance messaging system for cloud native applications.",
    icon: "⚡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.NATS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.NATS, "2.10-alpine", 4222),
    healthProbe: { type: "tcp", port: 4222 }
  },
  {
    id: IMAGE_IDS.PULSAR,
    name: "Apache Pulsar",
    image: "apachepulsar/pulsar",
    defaultTag: "3.2.2",
    category: CATEGORIES.MESSAGING,
    description: "All-in-one distributed messaging and streaming platform designed for cloud-native applications.",
    icon: "💫",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.PULSAR],
    defaultConfig: createDefaultConfig(IMAGE_IDS.PULSAR, "3.2.2", 6650),
    healthProbe: { type: "http", port: 8080, path: "/admin/v2/clusters" }
  },
  {
    id: IMAGE_IDS.ZOOKEEPER,
    name: "Apache ZooKeeper",
    image: "zookeeper",
    defaultTag: "3.9-alpine",
    category: CATEGORIES.MESSAGING,
    description: "Centralized service for maintaining configuration information, naming, and providing distributed synchronization.",
    icon: "🐒",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ZOOKEEPER],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ZOOKEEPER, "3.9-alpine", 2181),
    healthProbe: { type: "tcp", port: 2181 }
  },
  {
    id: IMAGE_IDS.SCHEMA_REGISTRY,
    name: "Confluent Schema Registry",
    image: "confluentinc/cp-schema-registry",
    defaultTag: "7.6.0",
    category: CATEGORIES.MESSAGING,
    description: "Serving RESTful interface for storing and retrieving Avro, JSON, and Protobuf schemas.",
    icon: "📜",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.SCHEMA_REGISTRY],
    defaultConfig: createDefaultConfig(IMAGE_IDS.SCHEMA_REGISTRY, "7.6.0", 8081, [
      { key: "SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS", value: "PLAINTEXT://localhost:9092" },
      { key: "SCHEMA_REGISTRY_HOST_NAME", value: "localhost" }
    ]),
    healthProbe: { type: "http", port: 8081, path: "/subjects" }
  },
  {
    id: IMAGE_IDS.KAFKA_UI,
    name: "Kafka UI",
    image: "provectuslabs/kafka-ui",
    defaultTag: "latest",
    category: CATEGORIES.MESSAGING,
    description: "Open-source web UI for monitoring and managing Apache Kafka clusters.",
    icon: "🖥️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.KAFKA_UI],
    defaultConfig: createDefaultConfig(IMAGE_IDS.KAFKA_UI, "latest", 8080, [
      { key: "KAFKA_CLUSTERS_0_NAME", value: "local" },
      { key: "KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS", value: "localhost:9092" }
    ]),
    healthProbe: { type: "http", port: 8080, path: "/actuator/health" }
  },
  {
    id: IMAGE_IDS.MOSQUITTO,
    name: "Eclipse Mosquitto",
    image: "eclipse-mosquitto",
    defaultTag: "2.0-alpine",
    category: CATEGORIES.MESSAGING,
    description: "Lightweight open source MQTT message broker suitable for IoT and telemetry devices.",
    icon: "🦟",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MOSQUITTO],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MOSQUITTO, "2.0-alpine", 1883),
    healthProbe: { type: "tcp", port: 1883 }
  },

  {
    id: IMAGE_IDS.GRAFANA,
    name: "Grafana Platform",
    image: "grafana/grafana",
    defaultTag: "10.4.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "Operational dashboards for your data, metrics, logs, and traces visualization.",
    icon: "📊",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.GRAFANA],
    defaultConfig: createDefaultConfig(IMAGE_IDS.GRAFANA, "10.4.0", 3000),
    healthProbe: { type: "http", port: 3000, path: "/api/health" }
  },
  {
    id: IMAGE_IDS.PROMETHEUS,
    name: "Prometheus",
    image: "prom/prometheus",
    defaultTag: "v2.51.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "Systems monitoring and alerting toolkit with a powerful time-series query language (PromQL).",
    icon: "🔥",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.PROMETHEUS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.PROMETHEUS, "v2.51.0", 9090),
    healthProbe: { type: "http", port: 9090, path: "/-/healthy" }
  },
  {
    id: IMAGE_IDS.JAEGER,
    name: "Jaeger Tracing",
    image: "jaegertracing/all-in-one",
    defaultTag: "1.56",
    category: CATEGORIES.OBSERVABILITY,
    description: "End-to-end distributed tracing platform for monitoring microservices architecture.",
    icon: "🔍",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.JAEGER],
    defaultConfig: createDefaultConfig(IMAGE_IDS.JAEGER, "1.56", 16686),
    healthProbe: { type: "http", port: 16686 }
  },
  {
    id: IMAGE_IDS.TEMPO,
    name: "Grafana Tempo",
    image: "grafana/tempo",
    defaultTag: "2.4.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "High-scale, easy-to-use, cost-effective distributed tracing backend.",
    icon: "⏱️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.TEMPO],
    defaultConfig: createDefaultConfig(IMAGE_IDS.TEMPO, "2.4.0", 3200),
    healthProbe: { type: "http", port: 3200, path: "/ready" }
  },
  {
    id: IMAGE_IDS.LOKI,
    name: "Grafana Loki",
    image: "grafana/loki",
    defaultTag: "2.9.5",
    category: CATEGORIES.OBSERVABILITY,
    description: "Horizontally scalable, highly available, multi-tenant log aggregation system.",
    icon: "🪵",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.LOKI],
    defaultConfig: createDefaultConfig(IMAGE_IDS.LOKI, "2.9.5", 3100),
    healthProbe: { type: "http", port: 3100, path: "/ready" }
  },
  {
    id: IMAGE_IDS.OPENTELEMETRY_COLLECTOR,
    name: "OTel Collector",
    image: "otel/opentelemetry-collector-contrib",
    defaultTag: "0.97.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "Vendor-agnostic proxy to receive, process, and export telemetry data.",
    icon: "📡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.OPENTELEMETRY_COLLECTOR],
    defaultConfig: createDefaultConfig(IMAGE_IDS.OPENTELEMETRY_COLLECTOR, "0.97.0", 4317),
    healthProbe: { type: "tcp", port: 4317 }
  },
  {
    id: IMAGE_IDS.ZIPKIN,
    name: "Zipkin Tracing",
    image: "openzipkin/zipkin",
    defaultTag: "3.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "Distributed tracing system helping gather timing data for microservices troubleshooting.",
    icon: "⚡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ZIPKIN],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ZIPKIN, "3.0", 9411),
    healthProbe: { type: "http", port: 9411, path: "/health" }
  },
  {
    id: IMAGE_IDS.ALERTMANAGER,
    name: "Prometheus Alertmanager",
    image: "prom/alertmanager",
    defaultTag: "v0.27.0",
    category: CATEGORIES.OBSERVABILITY,
    description: "Handles alerts sent by client applications such as Prometheus server.",
    icon: "🔔",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ALERTMANAGER],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ALERTMANAGER, "v0.27.0", 9093),
    healthProbe: { type: "http", port: 9093, path: "/-/healthy" }
  },
  {
    id: IMAGE_IDS.VECTOR,
    name: "Vector Pipeline",
    image: "timberio/vector",
    defaultTag: "0.37.0-alpine",
    category: CATEGORIES.OBSERVABILITY,
    description: "High-performance observability data pipeline for logs, metrics, and traces.",
    icon: "📐",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.VECTOR],
    defaultConfig: createDefaultConfig(IMAGE_IDS.VECTOR, "0.37.0-alpine", 8686),
    healthProbe: { type: "tcp", port: 8686 }
  },

  {
    id: IMAGE_IDS.ELASTICSEARCH,
    name: "Elasticsearch",
    image: "elasticsearch",
    defaultTag: "8.13.0",
    category: CATEGORIES.SEARCH,
    description: "Distributed, RESTful search and analytics engine for all types of data.",
    icon: "🔍",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ELASTICSEARCH],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ELASTICSEARCH, "8.13.0", 9200, [
      { key: "discovery.type", value: "single-node" },
      { key: "xpack.security.enabled", value: "false" }
    ]),
    healthProbe: { type: "http", port: 9200, path: "/_cluster/health" }
  },
  {
    id: IMAGE_IDS.KIBANA,
    name: "Kibana",
    image: "kibana",
    defaultTag: "8.13.0",
    category: CATEGORIES.SEARCH,
    description: "Visualization user interface for Elasticsearch data and Elastic Stack management.",
    icon: "📊",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.KIBANA],
    defaultConfig: createDefaultConfig(IMAGE_IDS.KIBANA, "8.13.0", 5601, [
      { key: "ELASTICSEARCH_HOSTS", value: "http://localhost:9200" }
    ]),
    healthProbe: { type: "http", port: 5601, path: "/api/status" }
  },
  {
    id: IMAGE_IDS.OPENSEARCH,
    name: "OpenSearch",
    image: "opensearchproject/opensearch",
    defaultTag: "2.12.0",
    category: CATEGORIES.SEARCH,
    description: "Community-driven, open-source search and analytics suite forked from Elasticsearch.",
    icon: "🔎",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.OPENSEARCH],
    defaultConfig: createDefaultConfig(IMAGE_IDS.OPENSEARCH, "2.12.0", 9200, [
      { key: "discovery.type", value: "single-node" },
      { key: "DISABLE_SECURITY_PLUGIN", value: "true" }
    ]),
    healthProbe: { type: "http", port: 9200 }
  },
  {
    id: IMAGE_IDS.MEILISEARCH,
    name: "Meilisearch",
    image: "getmeili/meilisearch",
    defaultTag: "v1.7",
    category: CATEGORIES.SEARCH,
    description: "Lightning-fast, hyper-relevant, and typo-tolerant search engine.",
    icon: "⚡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MEILISEARCH],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MEILISEARCH, "v1.7", 7700),
    healthProbe: { type: "http", port: 7700, path: "/health" }
  },
  {
    id: IMAGE_IDS.TYPESENSE,
    name: "Typesense",
    image: "typesense/typesense",
    defaultTag: "26.0",
    category: CATEGORIES.SEARCH,
    description: "Fast, typo-tolerant search engine built for delightful developer experience.",
    icon: "⚡",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.TYPESENSE],
    defaultConfig: createDefaultConfig(IMAGE_IDS.TYPESENSE, "26.0", 8108, [
      { key: "TYPESENSE_API_KEY", value: "xyz123key" },
      { key: "TYPESENSE_DATA_DIR", value: "/tmp" }
    ]),
    healthProbe: { type: "http", port: 8108, path: "/health" }
  },

  {
    id: IMAGE_IDS.NGINX,
    name: "Nginx HTTP Server",
    image: "nginx",
    defaultTag: "mainline-alpine",
    category: CATEGORIES.PROXY,
    description: "High-performance HTTP server, reverse proxy, and IMAP/POP3 proxy server.",
    icon: "🌐",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.NGINX],
    defaultConfig: createDefaultConfig(IMAGE_IDS.NGINX, "mainline-alpine", 80),
    healthProbe: { type: "http", port: 80 }
  },
  {
    id: IMAGE_IDS.TRAEFIK,
    name: "Traefik Proxy",
    image: "traefik",
    defaultTag: "v3.0",
    category: CATEGORIES.PROXY,
    description: "Modern HTTP reverse proxy and load balancer for microservices.",
    icon: "🚏",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.TRAEFIK],
    defaultConfig: createDefaultConfig(IMAGE_IDS.TRAEFIK, "v3.0", 8080),
    healthProbe: { type: "http", port: 8080, path: "/ping" }
  },
  {
    id: IMAGE_IDS.ENVOY,
    name: "Envoy Proxy",
    image: "envoyproxy/envoy",
    defaultTag: "v1.29-latest",
    category: CATEGORIES.PROXY,
    description: "High performance C++ edge/middle/service proxy designed for cloud native applications.",
    icon: "🛡️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ENVOY],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ENVOY, "v1.29-latest", 10000),
    healthProbe: { type: "tcp", port: 10000 }
  },
  {
    id: IMAGE_IDS.HAPROXY,
    name: "HAProxy",
    image: "haproxy",
    defaultTag: "2.9-alpine",
    category: CATEGORIES.PROXY,
    description: "Reliable, high performance TCP/HTTP load balancer.",
    icon: "⚖️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.HAPROXY],
    defaultConfig: createDefaultConfig(IMAGE_IDS.HAPROXY, "2.9-alpine", 80),
    healthProbe: { type: "tcp", port: 80 }
  },
  {
    id: IMAGE_IDS.CADDY,
    name: "Caddy Server",
    image: "caddy",
    defaultTag: "2-alpine",
    category: CATEGORIES.PROXY,
    description: "Powerful, enterprise-ready, open source web server with automatic HTTPS.",
    icon: "🔒",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.CADDY],
    defaultConfig: createDefaultConfig(IMAGE_IDS.CADDY, "2-alpine", 80),
    healthProbe: { type: "http", port: 80 }
  },
  {
    id: IMAGE_IDS.KONG,
    name: "Kong Gateway",
    image: "kong",
    defaultTag: "3.6",
    category: CATEGORIES.PROXY,
    description: "Cloud-native API gateway built on Nginx.",
    icon: "🦍",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.KONG],
    defaultConfig: createDefaultConfig(IMAGE_IDS.KONG, "3.6", 8000, [
      { key: "KONG_DATABASE", value: "off" }
    ]),
    healthProbe: { type: "http", port: 8001, path: "/status" }
  },

  {
    id: IMAGE_IDS.VAULT,
    name: "HashiCorp Vault",
    image: "vault",
    defaultTag: "1.16",
    category: CATEGORIES.SECURITY,
    description: "Manage secrets and protect sensitive data in cloud infrastructure.",
    icon: "🔐",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.VAULT],
    defaultConfig: createDefaultConfig(IMAGE_IDS.VAULT, "1.16", 8200, [
      { key: "VAULT_DEV_ROOT_TOKEN_ID", value: "root" }
    ]),
    healthProbe: { type: "http", port: 8200, path: "/v1/sys/health" }
  },
  {
    id: IMAGE_IDS.KEYCLOAK,
    name: "Keycloak IAM",
    image: "quay.io/keycloak/keycloak",
    defaultTag: "24.0",
    category: CATEGORIES.SECURITY,
    description: "Open source identity and access management for modern applications.",
    icon: "🔑",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.KEYCLOAK],
    defaultConfig: createDefaultConfig(IMAGE_IDS.KEYCLOAK, "24.0", 8080, [
      { key: "KEYCLOAK_ADMIN", value: "admin" },
      { key: "KEYCLOAK_ADMIN_PASSWORD", value: "admin" }
    ]),
    healthProbe: { type: "http", port: 8080, path: "/health/live" }
  },
  {
    id: IMAGE_IDS.ORY_KRATOS,
    name: "Ory Kratos IAM",
    image: "oryd/kratos",
    defaultTag: "v1.1.0",
    category: CATEGORIES.SECURITY,
    description: "Headless, cloud native user management and authentication system.",
    icon: "👤",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ORY_KRATOS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ORY_KRATOS, "v1.1.0", 4433),
    healthProbe: { type: "http", port: 4433, path: "/health/alive" }
  },

  {
    id: IMAGE_IDS.MINIO,
    name: "MinIO Object Storage",
    image: "minio/minio",
    defaultTag: "RELEASE.2024-03-30T09-41-56Z",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "High-performance S3 compatible object storage system.",
    icon: "📦",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.MINIO],
    defaultConfig: createDefaultConfig(IMAGE_IDS.MINIO, "RELEASE.2024-03-30T09-41-56Z", 9000, [
      { key: "MINIO_ROOT_USER", value: "minioadmin" },
      { key: "MINIO_ROOT_PASSWORD", value: "minioadmin" }
    ]),
    healthProbe: { type: "http", port: 9000, path: "/minio/health/live" }
  },
  {
    id: IMAGE_IDS.JENKINS,
    name: "Jenkins CI/CD",
    image: "jenkins/jenkins",
    defaultTag: "lts-jdk17",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Leading open source automation server providing hundreds of plugins for building and deploying.",
    icon: "🏗️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.JENKINS],
    defaultConfig: createDefaultConfig(IMAGE_IDS.JENKINS, "lts-jdk17", 8080),
    healthProbe: { type: "http", port: 8080, path: "/login" }
  },
  {
    id: IMAGE_IDS.CONSUL,
    name: "HashiCorp Consul",
    image: "consul",
    defaultTag: "1.18",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Service networking platform for service discovery, configuration, and segmentation.",
    icon: "🧭",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.CONSUL],
    defaultConfig: createDefaultConfig(IMAGE_IDS.CONSUL, "1.18", 8500),
    healthProbe: { type: "http", port: 8500, path: "/v1/status/leader" }
  },
  {
    id: IMAGE_IDS.ETCD,
    name: "etcd Key-Value",
    image: "bitnami/etcd",
    defaultTag: "3.5-debian-12",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Strongly consistent, distributed key-value store used for shared configuration and service discovery.",
    icon: "🗄️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.ETCD],
    defaultConfig: createDefaultConfig(IMAGE_IDS.ETCD, "3.5-debian-12", 2379, [
      { key: "ALLOW_NONE_AUTHENTICATION", value: "yes" }
    ]),
    healthProbe: { type: "http", port: 2379, path: "/health" }
  },
  {
    id: IMAGE_IDS.LOCALSTACK,
    name: "LocalStack AWS Cloud",
    image: "localstack/localstack",
    defaultTag: "3.3.0",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Fully functional local AWS cloud stack (S3, SQS, SNS, DynamoDB, Lambda, Kinesis, IAM).",
    icon: "☁️",
    officialUrl: DOCKER_HUB_URLS[IMAGE_IDS.LOCALSTACK],
    defaultConfig: createDefaultConfig(IMAGE_IDS.LOCALSTACK, "3.3.0", 4566),
    healthProbe: { type: "http", port: 4566, path: "/_localstack/health" }
  }
];
