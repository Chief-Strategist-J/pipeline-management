import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 20000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

interface ContainerInfo {
  name: string;
  image: string;
  env: Record<string, string>;
}

async function inspectContainer(containerId: string): Promise<ContainerInfo> {
  const { stdout } = await runCmd(
    `docker inspect --format '{{.Name}}|{{.Config.Image}}|{{range .Config.Env}}{{.}};{{end}}' ${containerId}`
  );

  const parts = stdout.trim().split("|");
  const name = (parts[0] || "").replace(/^\//, "");
  const image = parts[1] || "";
  const envRaw = parts[2] || "";

  const env: Record<string, string> = {};
  envRaw.split(";").filter(Boolean).forEach((entry) => {
    const eqIdx = entry.indexOf("=");
    if (eqIdx > 0) {
      const key = entry.substring(0, eqIdx);
      const val = entry.substring(eqIdx + 1);
      env[key] = val;
    }
  });

  return { name, image, env };
}

function preprocessCommand(info: ContainerInfo, rawCmd: string): string {
  let cleaned = rawCmd.trim();
  const lines = cleaned.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("--") && !l.startsWith("//"));
  const codeLines = lines.join(" ");

  const lowerName = info.name.toLowerCase();
  const lowerImage = info.image.toLowerCase();
  const lowerCmd = codeLines.toLowerCase();

  const isSql = /^(select|create|insert|update|delete|drop|alter|show|grant|revoke|with|\\d|\\l)\b/i.test(codeLines);

  if (lowerName.includes("postgres") || lowerImage.includes("postgres")) {
    const pgUser = info.env.POSTGRES_USER || "postgres";
    const pgDb = info.env.POSTGRES_DB || "postgres";

    if (cleaned === "psql" || cleaned.startsWith("psql -U") && !cleaned.includes("-c") && !cleaned.includes("-f")) {
      return `psql -U ${pgUser} -d ${pgDb} -c "SELECT current_database(), current_user, version(), now();"`;
    }
    if (cleaned === "\\l" || cleaned === "\\d" || cleaned === "show databases" || cleaned === "show tables") {
      return `psql -U ${pgUser} -d ${pgDb} -c "\\l"`;
    }
    if (isSql && !lowerCmd.includes("psql")) {
      return `psql -U ${pgUser} -d ${pgDb} -c ${JSON.stringify(codeLines)}`;
    }
  }

  if (lowerName.includes("mysql") || lowerImage.includes("mysql") || lowerName.includes("mariadb") || lowerImage.includes("mariadb")) {
    const mysqlUser = info.env.MYSQL_USER || "root";
    const mysqlPass = info.env.MYSQL_PASSWORD || info.env.MYSQL_ROOT_PASSWORD || info.env.MARIADB_ROOT_PASSWORD || "";
    const mysqlDb = info.env.MYSQL_DATABASE || "";

    const passFlag = mysqlPass ? `-p"${mysqlPass}"` : "";
    const dbArg = mysqlDb ? `"${mysqlDb}"` : "";

    if (isSql && !lowerCmd.includes("mysql")) {
      return `mysql -u ${mysqlUser} ${passFlag} ${dbArg} -e ${JSON.stringify(codeLines)}`;
    }
    if (cleaned === "mysql") {
      return `mysql -u ${mysqlUser} ${passFlag} -e "SHOW DATABASES;"`;
    }
  }

  if (lowerName.includes("kafka") || lowerImage.includes("kafka")) {
    if (lowerCmd === "list-topics" || lowerCmd === "topics" || lowerCmd === "kafka-topics") {
      return `kafka-topics.sh --bootstrap-server localhost:9092 --list || /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list`;
    }
    if (lowerCmd.startsWith("create-topic")) {
      const topicName = codeLines.split(" ")[1] || "test-topic";
      return `kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ${topicName} --partitions 1 --replication-factor 1 || /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ${topicName} --partitions 1 --replication-factor 1`;
    }
  }

  if (lowerName.includes("redis") || lowerImage.includes("redis")) {
    const isRedisCmd = /^(ping|set|get|keys|info|dbsize|hgetall|del|exists|type|flushall|flushdb)\b/i.test(codeLines);
    if (isRedisCmd && !lowerCmd.includes("redis-cli")) {
      return `redis-cli ${codeLines}`;
    }
  }

  if (lowerName.includes("mongo") || lowerImage.includes("mongo")) {
    const mongoUser = info.env.MONGO_INITDB_ROOT_USERNAME || "";
    const mongoPass = info.env.MONGO_INITDB_ROOT_PASSWORD || "";
    const authFlags = mongoUser ? `-u ${mongoUser} -p ${mongoPass} --authenticationDatabase admin` : "";

    if (codeLines === "show dbs" || codeLines === "show databases" || codeLines === "dbs") {
      return `mongosh ${authFlags} --quiet --eval "show dbs" || mongo ${authFlags} --quiet --eval "show dbs"`;
    }
    if (codeLines.startsWith("db.") || codeLines.startsWith("show collections")) {
      return `mongosh ${authFlags} --quiet --eval ${JSON.stringify(codeLines)} || mongo ${authFlags} --quiet --eval ${JSON.stringify(codeLines)}`;
    }
  }

  if (lowerName.includes("rabbitmq") || lowerImage.includes("rabbitmq")) {
    if (codeLines === "status" || codeLines === "queues" || codeLines === "list-queues") {
      return `rabbitmqctl status || rabbitmqctl list_queues`;
    }
  }

  if (lowerName.includes("vault") || lowerImage.includes("vault")) {
    if (codeLines === "status" || codeLines === "vault status") {
      return `VAULT_ADDR='http://127.0.0.1:8200' vault status`;
    }
  }

  if (lowerName.includes("elastic") || lowerImage.includes("elastic")) {
    if (codeLines === "health" || codeLines === "status" || codeLines === "cluster") {
      return `curl -s http://localhost:9200/_cluster/health?pretty`;
    }
    if (codeLines === "indices" || codeLines === "cat indices") {
      return `curl -s http://localhost:9200/_cat/indices?v`;
    }
  }

  return codeLines || cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, command } = body;

    if (!containerId || !command) {
      return NextResponse.json({ error: "containerId and command are required" }, { status: 400 });
    }

    const info = await inspectContainer(containerId);
    const finalCmd = preprocessCommand(info, command);

    const jsonCmd = JSON.stringify(finalCmd);
    let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${jsonCmd}`, 20000);

    if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
      const retryRes = await runCmd(`docker exec ${containerId} ${finalCmd}`, 20000);
      stdout = retryRes.stdout;
      stderr = retryRes.stderr;
    }

    const combinedOutput = [stdout, stderr]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join("\n");

    const isErrorExit = Boolean(
      stderr &&
      !stdout &&
      (stderr.includes("Error:") || stderr.includes("No such container") || stderr.includes("command not found"))
    );

    return NextResponse.json({
      exitCode: isErrorExit ? 1 : 0,
      output: combinedOutput || "(Command executed with no output)",
    });
  } catch (err: any) {
    return NextResponse.json({ exitCode: 1, output: err.message }, { status: 500 });
  }
}
