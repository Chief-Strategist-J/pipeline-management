import { IMAGE_IDS } from "./docker-lab.constants";

export interface HelpCommand {
  label: string;
  command: string;
  description: string;
  category: "General" | "Query" | "Admin" | "Inspection";
}

export const DOCKER_HELP_COMMANDS: Record<string, HelpCommand[]> = {
  [IMAGE_IDS.KAFKA]: [
    {
      label: "List Topics",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --list",
      description: "List all Kafka topics in the cluster",
      category: "Query",
    },
    {
      label: "Create Topic",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --create --topic pipeline-events --partitions 3 --replication-factor 1",
      description: "Create a new topic named pipeline-events with 3 partitions",
      category: "Admin",
    },
    {
      label: "Describe Topic",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic pipeline-events",
      description: "Display topic partition leader, replicas, and ISR state",
      category: "Inspection",
    },
    {
      label: "Produce Message",
      command: 'echo "Hello Docker Lab Event" | kafka-console-producer.sh --bootstrap-server localhost:9092 --topic pipeline-events',
      description: "Publish a message payload to Kafka topic",
      category: "Query",
    },
    {
      label: "Consume Messages",
      command: "kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic pipeline-events --from-beginning --timeout-ms 5000",
      description: "Consume messages from beginning of topic with 5s timeout",
      category: "Query",
    },
    {
      label: "List Consumer Groups",
      command: "kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list",
      description: "List active consumer group IDs",
      category: "Inspection",
    },
    {
      label: "Delete Topic",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic pipeline-events",
      description: "Delete specified topic from cluster",
      category: "Admin",
    },
  ],

  [IMAGE_IDS.POSTGRES]: [
    {
      label: "Database Info",
      command: "SELECT current_database(), current_user, version();",
      description: "Display connected database name, user, and PostgreSQL version",
      category: "Query",
    },
    {
      label: "List Public Tables",
      command: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';",
      description: "List all tables created in public schema",
      category: "Inspection",
    },
    {
      label: "Create Table",
      command: "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
      description: "Create sample users table with primary key",
      category: "Admin",
    },
    {
      label: "Insert Record",
      command: "INSERT INTO users (username) VALUES ('admin_user') RETURNING *;",
      description: "Insert a new row and return inserted record",
      category: "Query",
    },
    {
      label: "Query Records",
      command: "SELECT * FROM users ORDER BY id DESC LIMIT 10;",
      description: "Select latest 10 records from users table",
      category: "Query",
    },
    {
      label: "Database Size",
      command: "SELECT pg_size_pretty(pg_database_size(current_database()));",
      description: "Display physical disk space used by database",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.REDIS]: [
    {
      label: "Ping Server",
      command: "PING",
      description: "Test Redis in-memory server responsiveness (returns PONG)",
      category: "General",
    },
    {
      label: "Server Info",
      command: "INFO server",
      description: "Display Redis engine version, uptime, and OS architecture",
      category: "Inspection",
    },
    {
      label: "Set String Key",
      command: 'SET user:1001 "Alice Smith"',
      description: "Store key-value pair in memory",
      category: "Query",
    },
    {
      label: "Get String Key",
      command: "GET user:1001",
      description: "Retrieve stored string value",
      category: "Query",
    },
    {
      label: "List Matching Keys",
      command: "KEYS *",
      description: "Find all keys in current database index",
      category: "Query",
    },
    {
      label: "Database Size",
      command: "DBSIZE",
      description: "Return total key count in database",
      category: "Inspection",
    },
    {
      label: "Flush Database",
      command: "FLUSHDB",
      description: "Remove all keys from active database index",
      category: "Admin",
    },
  ],

  [IMAGE_IDS.MONGODB]: [
    {
      label: "List Databases",
      command: "show dbs",
      description: "List database schemas and size on disk",
      category: "Inspection",
    },
    {
      label: "Server Status",
      command: "db.serverStatus()",
      description: "Display memory usage, connections, and uptime",
      category: "Inspection",
    },
    {
      label: "Insert Document",
      command: 'db.events.insertOne({ name: "user_login", timestamp: new Date(), status: "success" })',
      description: "Insert JSON document into events collection",
      category: "Query",
    },
    {
      label: "Find Documents",
      command: "db.events.find().sort({ _id: -1 }).limit(5)",
      description: "Query 5 latest documents from events collection",
      category: "Query",
    },
    {
      label: "List Collections",
      command: "show collections",
      description: "List all document collections in active DB",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MYSQL]: [
    {
      label: "List Databases",
      command: "SHOW DATABASES;",
      description: "List all MySQL database schemas",
      category: "Inspection",
    },
    {
      label: "Show Tables",
      command: "SHOW TABLES;",
      description: "List all tables in selected schema",
      category: "Inspection",
    },
    {
      label: "Engine Version",
      command: "SELECT VERSION(), CURRENT_USER();",
      description: "Display MySQL server version and user",
      category: "Query",
    },
    {
      label: "Show Variables",
      command: "SHOW VARIABLES LIKE 'max_connections';",
      description: "Inspect server configuration variable",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MARIADB]: [
    {
      label: "List Databases",
      command: "SHOW DATABASES;",
      description: "List all MariaDB database schemas",
      category: "Inspection",
    },
    {
      label: "Check Uptime",
      command: "SHOW STATUS LIKE 'Uptime';",
      description: "Display uptime counter in seconds",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.INFLUXDB]: [
    {
      label: "Influx Ping",
      command: "influx ping",
      description: "Check InfluxDB 2.x API health",
      category: "General",
    },
    {
      label: "List Buckets",
      command: "influx bucket list",
      description: "List time-series data buckets",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.CASSANDRA]: [
    {
      label: "Describe Keyspaces",
      command: "DESCRIBE KEYSPACES;",
      description: "List all Cassandra keyspaces",
      category: "Inspection",
    },
    {
      label: "Describe Cluster",
      command: "DESCRIBE CLUSTER;",
      description: "Display cluster name and partitioner configuration",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.COCKROACHDB]: [
    {
      label: "Show Databases",
      command: "SHOW DATABASES;",
      description: "List all CockroachDB SQL databases",
      category: "Inspection",
    },
    {
      label: "Node Status",
      command: "SHOW NODES;",
      description: "Display active CockroachDB cluster nodes",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.TIMESCALEDB]: [
    {
      label: "Timescale Version",
      command: "SELECT extname, extversion FROM pg_extension WHERE extname = 'timescaledb';",
      description: "Verify TimescaleDB extension installation",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.SCYLLADB]: [
    {
      label: "Describe Keyspaces",
      command: "DESCRIBE KEYSPACES;",
      description: "List ScyllaDB CQL keyspaces",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.SURREALDB]: [
    {
      label: "Surreal Info",
      command: "INFO FOR DB;",
      description: "Display SurrealDB database schema info",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.CLICKHOUSE]: [
    {
      label: "Show Databases",
      command: "SHOW DATABASES;",
      description: "List all ClickHouse analytical databases",
      category: "Inspection",
    },
    {
      label: "System Uptime",
      command: "SELECT uptime();",
      description: "Return ClickHouse server uptime in seconds",
      category: "Query",
    },
  ],

  [IMAGE_IDS.NEO4J]: [
    {
      label: "Node Count",
      command: "MATCH (n) RETURN count(n) AS total_nodes;",
      description: "Count total graph nodes using Cypher query",
      category: "Query",
    },
  ],

  [IMAGE_IDS.QDRANT]: [
    {
      label: "Ready Check",
      command: "curl -s http://localhost:6333/readyz",
      description: "Verify Qdrant vector engine readiness endpoint",
      category: "General",
    },
    {
      label: "List Collections",
      command: "curl -s http://localhost:6333/collections",
      description: "List vector search collections",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MILVUS]: [
    {
      label: "Milvus Health",
      command: "curl -s http://localhost:9091/healthz",
      description: "Check Milvus vector database health",
      category: "General",
    },
  ],

  [IMAGE_IDS.WEAVIATE]: [
    {
      label: "Weaviate Readiness",
      command: "curl -s http://localhost:8080/v1/.well-known/ready",
      description: "Check Weaviate semantic search readiness",
      category: "General",
    },
    {
      label: "Get Schema",
      command: "curl -s http://localhost:8080/v1/schema",
      description: "List Weaviate vector classes and properties",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.CHROMA]: [
    {
      label: "Chroma Heartbeat",
      command: "curl -s http://localhost:8000/api/v1/heartbeat",
      description: "Check Chroma embedding database heartbeat",
      category: "General",
    },
  ],

  [IMAGE_IDS.RABBITMQ]: [
    {
      label: "List Queues",
      command: "rabbitmqctl list_queues",
      description: "List active AMQP message queues and unacknowledged messages",
      category: "Inspection",
    },
    {
      label: "Broker Status",
      command: "rabbitmqctl status",
      description: "Display RabbitMQ node memory, alarms, and plugins",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.NATS]: [
    {
      label: "Server Status",
      command: "nats-server status || curl -s http://localhost:8222/varz",
      description: "Check NATS server stats and connected clients",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.PULSAR]: [
    {
      label: "List Clusters",
      command: "pulsar-admin clusters list",
      description: "List Pulsar clusters",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.ZOOKEEPER]: [
    {
      label: "Ruok Health Check",
      command: 'echo "ruok" | nc localhost 2181 || echo "srvr" | nc localhost 2181',
      description: "Send 4-letter word command to check ZooKeeper status",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MOSQUITTO]: [
    {
      label: "Subscribe Test",
      command: "mosquitto_sub -t 'test/topic' -v -C 1",
      description: "Subscribe to test MQTT topic for 1 message",
      category: "Query",
    },
  ],

  [IMAGE_IDS.GRAFANA]: [
    {
      label: "List Plugins",
      command: "grafana-cli plugins ls",
      description: "List installed Grafana plugins",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.PROMETHEUS]: [
    {
      label: "Promtool Check",
      command: "promtool check config /etc/prometheus/prometheus.yml",
      description: "Validate Prometheus YAML configuration syntax",
      category: "Admin",
    },
  ],

  [IMAGE_IDS.ELASTICSEARCH]: [
    {
      label: "Cluster Health",
      command: "curl -s http://localhost:9200/_cluster/health?pretty",
      description: "Check cluster status (green/yellow/red) and node count",
      category: "Inspection",
    },
    {
      label: "List Indices",
      command: "curl -s http://localhost:9200/_cat/indices?v",
      description: "List all search indices with document counts and size",
      category: "Inspection",
    },
    {
      label: "Node Stats",
      command: "curl -s http://localhost:9200/_nodes/stats?pretty",
      description: "Inspect memory usage and JVM garbage collection stats",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.KIBANA]: [
    {
      label: "Kibana Status",
      command: "curl -s http://localhost:5601/api/status",
      description: "Check Kibana UI backend status",
      category: "General",
    },
  ],

  [IMAGE_IDS.NGINX]: [
    {
      label: "Nginx Version",
      command: "nginx -v",
      description: "Display installed Nginx version",
      category: "General",
    },
    {
      label: "Test Config",
      command: "nginx -t",
      description: "Test configuration file syntax without reloading",
      category: "Admin",
    },
  ],

  [IMAGE_IDS.TRAEFIK]: [
    {
      label: "Traefik Ping",
      command: "curl -s http://localhost:8080/ping",
      description: "Check Traefik reverse proxy ping endpoint",
      category: "General",
    },
  ],

  [IMAGE_IDS.VAULT]: [
    {
      label: "Vault Seal Status",
      command: "vault status",
      description: "Check Vault initialization and seal status",
      category: "Inspection",
    },
    {
      label: "List Secrets Engines",
      command: "vault secrets list",
      description: "List enabled KV and auth secret engines",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.KEYCLOAK]: [
    {
      label: "Keycloak Info",
      command: "/opt/keycloak/bin/kc.sh --version",
      description: "Print Keycloak IAM distribution version",
      category: "General",
    },
  ],

  [IMAGE_IDS.MINIO]: [
    {
      label: "MinIO Health",
      command: "curl -s http://localhost:9000/minio/health/live",
      description: "Check MinIO S3 object storage liveness",
      category: "General",
    },
  ],

  [IMAGE_IDS.JENKINS]: [
    {
      label: "Jenkins Plugins",
      command: "jenkins-plugin-cli --list",
      description: "List installed Jenkins automation plugins",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.CONSUL]: [
    {
      label: "Leader Status",
      command: "consul operator raft list-peers",
      description: "Inspect Raft consensus leader and peers",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.ETCD]: [
    {
      label: "etcd Member List",
      command: "etcdctl member list",
      description: "List etcd distributed key-value cluster members",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.LOCALSTACK]: [
    {
      label: "LocalStack Health",
      command: "curl -s http://localhost:4566/_localstack/health",
      description: "Check emulated AWS services health status",
      category: "General",
    },
  ],
};

export const DEFAULT_HELP_COMMANDS: HelpCommand[] = [
  {
    label: "Process Status",
    command: "ps aux",
    description: "Display all active running processes in container",
    category: "General",
  },
  {
    label: "Network Sockets",
    command: "netstat -tuln || ss -tuln",
    description: "Display active listening TCP/UDP sockets",
    category: "Inspection",
  },
  {
    label: "Disk Space Usage",
    command: "df -h",
    description: "Display file system disk space usage",
    category: "Inspection",
  },
  {
    label: "Environment Variables",
    command: "env",
    description: "Print container environment variables",
    category: "Inspection",
  },
];
