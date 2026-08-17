/**
 * Docker Lab Container Execution API Route (/api/docker-lab/exec)
 * 
 * ALGORITHM / END-TO-END EXECUTION FLOW:
 * Step 1: Parse { containerId, command } payload from POST request.
 * Step 2: Inspect running container via `docker inspect` to extract live environment variables
 *         (e.g., POSTGRES_USER, POSTGRES_DB, MYSQL_USER, MYSQL_ROOT_PASSWORD, MONGO_INITDB_ROOT_USERNAME).
 * Step 3: Construct RuleContext object containing container metadata, live environment, and command syntax flags.
 * Step 4: Pass RuleContext to Core Rules Engine (resolveFirstRuleTransform).
 * Step 5: Rules Engine selects highest-priority matching rule from dockerExecRules (100 -> 10)
 *         and transforms command (e.g. auto-wrapping SQL or expanding $PATH for native binaries).
 * Step 6: Safely JSON stringify transformed command and execute inside container via `docker exec containerId sh -c ...`.
 * Step 7: Combine stdout and stderr, return exitCode and output payload to client.
 */

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { resolveFirstRuleTransform } from "@/core/rules-engine/evaluate";
import type { RuleContext } from "@/core/rules-engine/rule.types";
import { dockerExecRules } from "@/features/docker-lab/rules/docker-exec.rules";

const execAsync = promisify(exec);

async function runCmd(command: string, timeoutMs: number = 25000): Promise<{ stdout: string; stderr: string }> {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { containerId, command } = body;

    if (!containerId || !command) {
      return NextResponse.json({ error: "containerId and command are required" }, { status: 400 });
    }

    const info = await inspectContainer(containerId);
    let cleaned = (command || "").trim();
    const lines = cleaned.split("\n").map((l: string) => l.trim()).filter((l: string) => l && !l.startsWith("--") && !l.startsWith("//"));
    const codeLines = lines.join(" ");
    const isSql = /^(select|create|insert|update|delete|drop|alter|show|grant|revoke|with|\\d|\\l)\b/i.test(codeLines);

    const ruleContext: RuleContext = {
      containerName: info.name,
      image: info.image,
      env: info.env,
      rawCommand: command,
      codeLines,
      isSql,
    };

    const finalCmd = await resolveFirstRuleTransform(dockerExecRules, ruleContext);

    const jsonCmd = JSON.stringify(finalCmd);
    let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${jsonCmd}`, 25000);

    if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
      const retryRes = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
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
