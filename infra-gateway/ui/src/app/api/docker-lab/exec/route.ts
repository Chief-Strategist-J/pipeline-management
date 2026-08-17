import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 15000): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command, { timeout: timeoutMs, maxBuffer: 1024 * 1024 * 5 });
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || err.message || String(err) };
  }
}

function preprocessCommand(containerName: string, rawCmd: string): string {
  let cleaned = rawCmd.trim();

  const lines = cleaned.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("--"));
  const codeLines = lines.join(" ");

  const lowerName = containerName.toLowerCase();
  const lowerCmd = codeLines.toLowerCase();

  const isSql = /^(select|create|insert|update|delete|drop|alter|show|with|\\d|\\l)\b/i.test(codeLines);

  if (lowerName.includes("postgres")) {
    if (cleaned === "psql -U postgres -d testdb" || cleaned === "psql") {
      return `psql -U postgres -d testdb -c "SELECT current_database(), current_user, now();"`;
    }
    if (isSql && !lowerCmd.includes("psql")) {
      return `psql -U postgres -d testdb -c ${JSON.stringify(codeLines)}`;
    }
  }

  if (lowerName.includes("mysql") || lowerName.includes("mariadb")) {
    if (isSql && !lowerCmd.includes("mysql")) {
      return `mysql -u root -prootpass testdb -e ${JSON.stringify(codeLines)}`;
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

    const { stdout: nameOut } = await runCmd(`docker inspect --format '{{.Name}} {{.Config.Image}}' ${containerId}`);
    const finalCmd = preprocessCommand(nameOut, command);

    const jsonCmd = JSON.stringify(finalCmd);
    let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${jsonCmd}`, 15000);

    if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
      const retryRes = await runCmd(`docker exec ${containerId} ${finalCmd}`, 15000);
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
