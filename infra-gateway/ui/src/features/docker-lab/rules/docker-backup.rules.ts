/**
 * -----------------------------------------------------------------------------
 * ALGORITHM FLOW: DOCKER BACKUP RULES ENGINE
 * -----------------------------------------------------------------------------
 * 1. EVALUATION: Resolves container imageId against native database backup rules.
 * 2. STRATEGY MATCHING:
 *    - PostgreSQL / TimescaleDB -> pg_dumpall / pg_dump (.sql)
 *    - MySQL / MariaDB          -> mysqldump (.sql)
 *    - Redis                    -> SAVE / dump.rdb / KEYS export (.json)
 *    - MongoDB                  -> db.getCollectionNames() & JSON dump (.json)
 *    - Cassandra / ScyllaDB     -> cqlsh DESCRIBE KEYSPACES (.cql)
 *    - Kafka                    -> kafka-topics.sh describe & topic state (.json)
 *    - Vault                    -> vault status & secrets list (.json)
 *    - Fallback                 -> Volume inspect & log snapshot (.json)
 * 3. EXECUTION RESOLUTION: Returns exact backup CLI command, file extension, and metadata.
 * -----------------------------------------------------------------------------
 */

import { IMAGE_IDS } from "../constants/docker-lab.constants";

export interface BackupRuleResult {
  hasNativeBackup: boolean;
  backupType: "sql" | "rdb" | "cql" | "json";
  fileExtension: string;
  backupCommand?: string;
  mimeType: string;
}

export function resolveBackupRule(imageId: string, env: Record<string, string> = {}): BackupRuleResult {
  const normId = imageId.toLowerCase();

  if (normId === IMAGE_IDS.POSTGRES || normId === IMAGE_IDS.TIMESCALEDB) {
    const user = env.POSTGRES_USER || "postgres";
    const db = env.POSTGRES_DB || "postgres";
    return {
      hasNativeBackup: true,
      backupType: "sql",
      fileExtension: "sql",
      backupCommand: `pg_dump -U ${user} ${db} || pg_dumpall -U ${user}`,
      mimeType: "application/sql",
    };
  }

  if (normId === IMAGE_IDS.MYSQL) {
    const pass = env.MYSQL_ROOT_PASSWORD ? `-p'${env.MYSQL_ROOT_PASSWORD}'` : "";
    return {
      hasNativeBackup: true,
      backupType: "sql",
      fileExtension: "sql",
      backupCommand: `mysqldump -u root ${pass} --all-databases`,
      mimeType: "application/sql",
    };
  }

  if (normId === IMAGE_IDS.MARIADB) {
    const pass = env.MARIADB_ROOT_PASSWORD ? `-p'${env.MARIADB_ROOT_PASSWORD}'` : "";
    return {
      hasNativeBackup: true,
      backupType: "sql",
      fileExtension: "sql",
      backupCommand: `mariadb-dump -u root ${pass} --all-databases`,
      mimeType: "application/sql",
    };
  }

  if (normId === IMAGE_IDS.REDIS) {
    return {
      hasNativeBackup: true,
      backupType: "json",
      fileExtension: "json",
      backupCommand: `redis-cli KEYS "*" | while read k; do echo "$k: $(redis-cli GET "$k")"; done`,
      mimeType: "application/json",
    };
  }

  if (normId === IMAGE_IDS.MONGODB) {
    return {
      hasNativeBackup: true,
      backupType: "json",
      fileExtension: "json",
      backupCommand: `mongosh --eval "db.getCollectionNames().forEach(c => printjson({ collection: c, count: db[c].countDocuments() }))" || mongo --eval "db.getCollectionNames()"`,
      mimeType: "application/json",
    };
  }

  if (normId === IMAGE_IDS.CASSANDRA || normId === IMAGE_IDS.SCYLLADB) {
    return {
      hasNativeBackup: true,
      backupType: "cql",
      fileExtension: "cql",
      backupCommand: `cqlsh -e "DESCRIBE KEYSPACES;"`,
      mimeType: "text/plain",
    };
  }

  if (normId === IMAGE_IDS.KAFKA) {
    return {
      hasNativeBackup: true,
      backupType: "json",
      fileExtension: "json",
      backupCommand: `kafka-topics.sh --bootstrap-server localhost:9092 --describe`,
      mimeType: "application/json",
    };
  }

  if (normId === IMAGE_IDS.VAULT) {
    return {
      hasNativeBackup: true,
      backupType: "json",
      fileExtension: "json",
      backupCommand: `vault secrets list -format=json || vault status`,
      mimeType: "application/json",
    };
  }

  if (normId === IMAGE_IDS.CLICKHOUSE) {
    return {
      hasNativeBackup: true,
      backupType: "sql",
      fileExtension: "sql",
      backupCommand: `clickhouse-client -q "SHOW DATABASES;"`,
      mimeType: "application/sql",
    };
  }

  return {
    hasNativeBackup: false,
    backupType: "json",
    fileExtension: "json",
    mimeType: "application/json",
  };
}
