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
      description: "List all Kafka topics in cluster",
      category: "Query",
    },
    {
      label: "Create Topic",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --create --topic pipeline-events --partitions 3 --replication-factor 1",
      description: "Create a new Kafka topic with 3 partitions",
      category: "Admin",
    },
    {
      label: "Describe Topic",
      command: "kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic pipeline-events",
      description: "Display metadata and partition offsets for topic",
      category: "Inspection",
    },
    {
      label: "Produce Message",
      command: 'echo "Hello Docker Lab" | kafka-console-producer.sh --bootstrap-server localhost:9092 --topic pipeline-events',
      description: "Publish a test message to Kafka topic",
      category: "Query",
    },
    {
      label: "Consume Messages",
      command: "kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic pipeline-events --from-beginning --timeout-ms 5000",
      description: "Consume messages from the beginning of topic",
      category: "Query",
    },
    {
      label: "List Consumer Groups",
      command: "kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list",
      description: "List active consumer groups",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.POSTGRES]: [
    {
      label: "Database Info",
      command: "SELECT current_database(), current_user, version();",
      description: "Display connected database, active user, and PostgreSQL version",
      category: "Query",
    },
    {
      label: "List Tables",
      command: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';",
      description: "List all public database tables",
      category: "Inspection",
    },
    {
      label: "Create Table",
      command: "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
      description: "Create sample user table",
      category: "Admin",
    },
    {
      label: "Insert Row",
      command: "INSERT INTO users (username) VALUES ('admin_user') RETURNING *;",
      description: "Insert sample row into table",
      category: "Query",
    },
    {
      label: "Query Rows",
      command: "SELECT * FROM users LIMIT 10;",
      description: "Select sample rows from table",
      category: "Query",
    },
  ],

  [IMAGE_IDS.REDIS]: [
    {
      label: "Ping Server",
      command: "PING",
      description: "Test Redis server connectivity",
      category: "General",
    },
    {
      label: "Server Info",
      command: "INFO server",
      description: "Display Redis server statistics and version",
      category: "Inspection",
    },
    {
      label: "Set Key",
      command: 'SET user:1001 "Alice Smith"',
      description: "Store a key-value pair",
      category: "Query",
    },
    {
      label: "Get Key",
      command: "GET user:1001",
      description: "Retrieve stored value for key",
      category: "Query",
    },
    {
      label: "List All Keys",
      command: "KEYS *",
      description: "Find all keys in database",
      category: "Query",
    },
    {
      label: "Database Size",
      command: "DBSIZE",
      description: "Return total number of keys in active database",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MONGODB]: [
    {
      label: "List Databases",
      command: "show dbs",
      description: "List all database names and storage sizes",
      category: "Inspection",
    },
    {
      label: "Server Status",
      command: "db.serverStatus()",
      description: "Display detailed MongoDB server health metrics",
      category: "Inspection",
    },
    {
      label: "Insert Document",
      command: 'db.events.insertOne({ name: "user_signup", timestamp: new Date() })',
      description: "Insert a JSON document into collection",
      category: "Query",
    },
    {
      label: "Find Documents",
      command: "db.events.find().limit(5)",
      description: "Query documents from collection",
      category: "Query",
    },
    {
      label: "List Collections",
      command: "show collections",
      description: "List collections in active database",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.MYSQL]: [
    {
      label: "Show Databases",
      command: "SHOW DATABASES;",
      description: "List all MySQL database schemas",
      category: "Inspection",
    },
    {
      label: "Show Tables",
      command: "SHOW TABLES;",
      description: "List all tables in selected database",
      category: "Inspection",
    },
    {
      label: "Server Version",
      command: "SELECT VERSION(), CURRENT_USER();",
      description: "Display MySQL engine version and current user",
      category: "Query",
    },
  ],

  [IMAGE_IDS.MARIADB]: [
    {
      label: "Show Databases",
      command: "SHOW DATABASES;",
      description: "List all MariaDB database schemas",
      category: "Inspection",
    },
    {
      label: "Show Status",
      command: "SHOW STATUS LIKE 'Uptime';",
      description: "Check server uptime status",
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
      label: "Cluster Info",
      command: "DESCRIBE CLUSTER;",
      description: "Display Cassandra cluster info",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.QDRANT]: [
    {
      label: "Health Check",
      command: "curl -s http://localhost:6333/readyz",
      description: "Verify Qdrant vector engine readiness",
      category: "General",
    },
    {
      label: "List Collections",
      command: "curl -s http://localhost:6333/collections",
      description: "List all vector collections",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.VAULT]: [
    {
      label: "Vault Status",
      command: "vault status",
      description: "Check HashiCorp Vault seal status and initialization state",
      category: "Inspection",
    },
    {
      label: "List Secret Engines",
      command: "vault secrets list",
      description: "List enabled secret engines",
      category: "Inspection",
    },
  ],

  [IMAGE_IDS.NGINX]: [
    {
      label: "Nginx Version",
      command: "nginx -v",
      description: "Print Nginx server version",
      category: "General",
    },
    {
      label: "Test Config Syntax",
      command: "nginx -t",
      description: "Verify syntax of nginx.conf file",
      category: "Admin",
    },
  ],

  [IMAGE_IDS.ELASTICSEARCH]: [
    {
      label: "Cluster Health",
      command: "curl -s http://localhost:9200/_cluster/health",
      description: "Check Elasticsearch cluster health status (green/yellow/red)",
      category: "Inspection",
    },
    {
      label: "List Indices",
      command: "curl -s http://localhost:9200/_cat/indices?v",
      description: "List all search indices",
      category: "Inspection",
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
    label: "Network Connections",
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
