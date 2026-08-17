import type { Rule } from "@/core/rules-engine/rule.types";

export const dockerExecRules: Rule[] = [
  {
    id: "rule-postgres-sql-transform",
    name: "PostgreSQL SQL Command Auto-Wrapper",
    category: "transform",
    priority: 100,
    enabled: true,
    condition: (ctx) => {
      const nameMatch = ctx.containerName.toLowerCase().includes("postgres") || ctx.image.toLowerCase().includes("postgres");
      const notPsql = !ctx.codeLines.toLowerCase().includes("psql");
      return nameMatch && ctx.isSql && notPsql;
    },
    transform: (ctx) => {
      const pgUser = ctx.env.POSTGRES_USER || "postgres";
      const pgDb = ctx.env.POSTGRES_DB || "postgres";
      return `PATH=$PATH:/usr/local/bin:/usr/bin psql -U ${pgUser} -d ${pgDb} -c ${JSON.stringify(ctx.codeLines)}`;
    },
  },
  {
    id: "rule-mysql-mariadb-sql-transform",
    name: "MySQL / MariaDB SQL Command Auto-Wrapper",
    category: "transform",
    priority: 90,
    enabled: true,
    condition: (ctx) => {
      const nameMatch = ctx.containerName.toLowerCase().includes("mysql") ||
        ctx.image.toLowerCase().includes("mysql") ||
        ctx.containerName.toLowerCase().includes("mariadb") ||
        ctx.image.toLowerCase().includes("mariadb");
      const notMysql = !ctx.codeLines.toLowerCase().includes("mysql");
      return nameMatch && ctx.isSql && notMysql;
    },
    transform: (ctx) => {
      const mysqlUser = ctx.env.MYSQL_USER || "root";
      const mysqlPass = ctx.env.MYSQL_PASSWORD || ctx.env.MYSQL_ROOT_PASSWORD || ctx.env.MARIADB_ROOT_PASSWORD || "";
      const mysqlDb = ctx.env.MYSQL_DATABASE || "";
      const passFlag = mysqlPass ? `-p"${mysqlPass}"` : "";
      return `PATH=$PATH:/usr/local/bin:/usr/bin mysql -u ${mysqlUser} ${passFlag} ${mysqlDb ? `"${mysqlDb}"` : ""} -e ${JSON.stringify(ctx.codeLines)}`;
    },
  },
  {
    id: "rule-default-path-expansion",
    name: "Default Native Binary PATH Expansion",
    category: "routing",
    priority: 10,
    enabled: true,
    condition: () => true,
    transform: (ctx) => {
      return `PATH=$PATH:/opt/kafka/bin:/usr/local/bin:/usr/bin:/bin ${ctx.codeLines || ctx.rawCommand}`;
    },
  },
];
