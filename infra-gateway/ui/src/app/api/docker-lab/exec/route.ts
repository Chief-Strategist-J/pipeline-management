/**
 * Docker Lab Container Execution API Route (/api/docker-lab/exec)
 * 
 * ALGORITHM / END-TO-END EXECUTION FLOW:
 * Step 1: Parse { containerId, command } payload from POST request.
 * Step 2: Inspect running container via `docker inspect` to extract live environment variables.
 * Step 3: Construct RuleContext object containing container metadata, live environment, and command syntax flags.
 * Step 4: Rule Engine Phase 1 (Command Transformation): Pass RuleContext to resolveFirstRuleTransform.
 *         Selects highest-priority rule from dockerExecRules (100 -> 10) to transform command.
 * Step 5: Rule Engine Phase 2 (Execution Strategy & Post-Processing): Pass RuleContext & transformed command
 *         to resolveExecutionStrategy (dockerExecStrategyRules).
 * Step 6: Execute container process via selected strategy (distroless direct vs shell wrapper with fallback).
 * Step 7: Evaluate image-specific error signatures and return formatted JSON response { exitCode, output }.
 */

import { NextResponse } from "next/server";
import { resolveFirstRuleTransform } from "@/core/rules-engine/evaluate";
import type { RuleContext } from "@/core/rules-engine/rule.types";
import { dockerExecRules } from "@/features/docker-lab/rules/docker-exec.rules";
import { dockerExecStrategyRules, resolveExecutionStrategy } from "@/features/docker-lab/rules/docker-exec-strategy.rules";
import { runCmd } from "@/features/docker-lab/utils/exec.utils";

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
    const result = await resolveExecutionStrategy(dockerExecStrategyRules, ruleContext, containerId, finalCmd);

    return NextResponse.json({
      exitCode: result.isErrorExit ? 1 : 0,
      output: result.output,
    });
  } catch (err: any) {
    return NextResponse.json({ exitCode: 1, output: err.message }, { status: 500 });
  }
}
