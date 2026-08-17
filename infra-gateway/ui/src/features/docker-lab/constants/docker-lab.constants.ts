export const IMAGE_IDS = {
  REDIS: "redis",
  POSTGRES: "postgres",
  MYSQL: "mysql",
  MARIADB: "mariadb",
  MONGODB: "mongodb",
  INFLUXDB: "influxdb",
  CASSANDRA: "cassandra",
  COCKROACHDB: "cockroachdb",
  TIMESCALEDB: "timescaledb",
  SCYLLADB: "scylladb",
  SURREALDB: "surrealdb",
  CLICKHOUSE: "clickhouse",
  NEO4J: "neo4j",
  QDRANT: "qdrant",
  MILVUS: "milvus",
  WEAVIATE: "weaviate",
  CHROMA: "chroma",

  KAFKA: "kafka",
  RABBITMQ: "rabbitmq",
  NATS: "nats",
  PULSAR: "pulsar",
  ZOOKEEPER: "zookeeper",
  SCHEMA_REGISTRY: "schema-registry",
  KAFKA_UI: "kafka-ui",
  MOSQUITTO: "mosquitto",

  GRAFANA: "grafana",
  PROMETHEUS: "prometheus",
  JAEGER: "jaeger",
  TEMPO: "tempo",
  LOKI: "loki",
  OPENTELEMETRY_COLLECTOR: "opentelemetry-collector",
  ZIPKIN: "zipkin",
  ALERTMANAGER: "alertmanager",
  VECTOR: "vector",

  ELASTICSEARCH: "elasticsearch",
  KIBANA: "kibana",
  OPENSEARCH: "opensearch",
  MEILISEARCH: "meilisearch",
  TYPESENSE: "typesense",

  NGINX: "nginx",
  TRAEFIK: "traefik",
  ENVOY: "envoy",
  HAPROXY: "haproxy",
  CADDY: "caddy",
  KONG: "kong",

  VAULT: "vault",
  KEYCLOAK: "keycloak",
  ORY_KRATOS: "ory-kratos",

  MINIO: "minio",
  JENKINS: "jenkins",
  CONSUL: "consul",
  ETCD: "etcd",
  LOCALSTACK: "localstack",
} as const;

export type ImageId = typeof IMAGE_IDS[keyof typeof IMAGE_IDS];

export const CATEGORIES = {
  DATABASES: "Databases",
  MESSAGING: "Messaging & Streaming",
  OBSERVABILITY: "Observability & Tracing",
  SEARCH: "Search Engines",
  PROXY: "Proxy & Gateway",
  SECURITY: "Security & Identity",
  AI_VECTOR: "AI & Vector DBs",
  INFRASTRUCTURE: "Dev & Infrastructure",
} as const;

export type CategoryKind = typeof CATEGORIES[keyof typeof CATEGORIES];

export const RULE_CATEGORIES = {
  TRANSFORM: "transform",
  ROUTING: "routing",
  SECURITY: "security",
  VALIDATION: "validation",
} as const;

export const RULE_PRIORITIES = {
  CRITICAL: 100,
  HIGH: 90,
  MEDIUM: 70,
  LOW: 40,
  FALLBACK: 10,
} as const;

export const RULE_IDS: Record<string, string> = Object.fromEntries(
  Object.values(IMAGE_IDS).map((id) => [id, `rule-${id}`])
);
