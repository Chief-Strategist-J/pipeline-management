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

export const DOCKER_HUB_URLS: Record<string, string> = {
  [IMAGE_IDS.REDIS]: "https://hub.docker.com/_/redis",
  [IMAGE_IDS.POSTGRES]: "https://hub.docker.com/_/postgres",
  [IMAGE_IDS.MYSQL]: "https://hub.docker.com/_/mysql",
  [IMAGE_IDS.MARIADB]: "https://hub.docker.com/_/mariadb",
  [IMAGE_IDS.MONGODB]: "https://hub.docker.com/_/mongo",
  [IMAGE_IDS.INFLUXDB]: "https://hub.docker.com/_/influxdb",
  [IMAGE_IDS.CASSANDRA]: "https://hub.docker.com/_/cassandra",
  [IMAGE_IDS.COCKROACHDB]: "https://hub.docker.com/r/cockroachdb/cockroach",
  [IMAGE_IDS.TIMESCALEDB]: "https://hub.docker.com/r/timescale/timescaledb",
  [IMAGE_IDS.SCYLLADB]: "https://hub.docker.com/r/scylladb/scylla",
  [IMAGE_IDS.SURREALDB]: "https://hub.docker.com/r/surrealdb/surrealdb",
  [IMAGE_IDS.CLICKHOUSE]: "https://hub.docker.com/r/clickhouse/clickhouse-server",
  [IMAGE_IDS.NEO4J]: "https://hub.docker.com/_/neo4j",
  [IMAGE_IDS.QDRANT]: "https://hub.docker.com/r/qdrant/qdrant",
  [IMAGE_IDS.MILVUS]: "https://hub.docker.com/r/milvusdb/milvus",
  [IMAGE_IDS.WEAVIATE]: "https://hub.docker.com/r/semitechnologies/weaviate",
  [IMAGE_IDS.CHROMA]: "https://hub.docker.com/r/chromadb/chroma",

  [IMAGE_IDS.KAFKA]: "https://hub.docker.com/r/apache/kafka",
  [IMAGE_IDS.RABBITMQ]: "https://hub.docker.com/_/rabbitmq",
  [IMAGE_IDS.NATS]: "https://hub.docker.com/_/nats",
  [IMAGE_IDS.PULSAR]: "https://hub.docker.com/r/apachepulsar/pulsar",
  [IMAGE_IDS.ZOOKEEPER]: "https://hub.docker.com/_/zookeeper",
  [IMAGE_IDS.SCHEMA_REGISTRY]: "https://hub.docker.com/r/confluentinc/cp-schema-registry",
  [IMAGE_IDS.KAFKA_UI]: "https://hub.docker.com/r/provectuslabs/kafka-ui",
  [IMAGE_IDS.MOSQUITTO]: "https://hub.docker.com/_/eclipse-mosquitto",

  [IMAGE_IDS.GRAFANA]: "https://hub.docker.com/r/grafana/grafana",
  [IMAGE_IDS.PROMETHEUS]: "https://hub.docker.com/r/prom/prometheus",
  [IMAGE_IDS.JAEGER]: "https://hub.docker.com/r/jaegertracing/all-in-one",
  [IMAGE_IDS.TEMPO]: "https://hub.docker.com/r/grafana/tempo",
  [IMAGE_IDS.LOKI]: "https://hub.docker.com/r/grafana/loki",
  [IMAGE_IDS.OPENTELEMETRY_COLLECTOR]: "https://hub.docker.com/r/otel/opentelemetry-collector-contrib",
  [IMAGE_IDS.ZIPKIN]: "https://hub.docker.com/r/openzipkin/zipkin",
  [IMAGE_IDS.ALERTMANAGER]: "https://hub.docker.com/r/prom/alertmanager",
  [IMAGE_IDS.VECTOR]: "https://hub.docker.com/r/timberio/vector",

  [IMAGE_IDS.ELASTICSEARCH]: "https://hub.docker.com/_/elasticsearch",
  [IMAGE_IDS.KIBANA]: "https://hub.docker.com/_/kibana",
  [IMAGE_IDS.OPENSEARCH]: "https://hub.docker.com/r/opensearchproject/opensearch",
  [IMAGE_IDS.MEILISEARCH]: "https://hub.docker.com/r/getmeili/meilisearch",
  [IMAGE_IDS.TYPESENSE]: "https://hub.docker.com/r/typesense/typesense",

  [IMAGE_IDS.NGINX]: "https://hub.docker.com/_/nginx",
  [IMAGE_IDS.TRAEFIK]: "https://hub.docker.com/_/traefik",
  [IMAGE_IDS.ENVOY]: "https://hub.docker.com/r/envoyproxy/envoy",
  [IMAGE_IDS.HAPROXY]: "https://hub.docker.com/_/haproxy",
  [IMAGE_IDS.CADDY]: "https://hub.docker.com/_/caddy",
  [IMAGE_IDS.KONG]: "https://hub.docker.com/_/kong",

  [IMAGE_IDS.VAULT]: "https://hub.docker.com/_/vault",
  [IMAGE_IDS.KEYCLOAK]: "https://hub.docker.com/r/quay.io/keycloak/keycloak",
  [IMAGE_IDS.ORY_KRATOS]: "https://hub.docker.com/r/oryd/kratos",

  [IMAGE_IDS.MINIO]: "https://hub.docker.com/r/minio/minio",
  [IMAGE_IDS.JENKINS]: "https://hub.docker.com/r/jenkins/jenkins",
  [IMAGE_IDS.CONSUL]: "https://hub.docker.com/_/consul",
  [IMAGE_IDS.ETCD]: "https://hub.docker.com/r/bitnami/etcd",
  [IMAGE_IDS.LOCALSTACK]: "https://hub.docker.com/r/localstack/localstack",
};

export const RULE_IDS: Record<string, string> = Object.fromEntries(
  Object.values(IMAGE_IDS).map((id) => [id, `rule-${id}`])
);
