/**
 * Docker Lab Container Execution Gateway Route (/api/docker-lab/exec)
 * 
 * END-TO-END 3-PHASE RULES ENGINE ALGORITHM:
 * 
 * Phase 0: Context Preparation & Dynamic Parsing (dockerContextParserRules)
 *   1. Inspect target container runtime via `docker inspect` to extract dynamic environment variables.
 *   2. Evaluate `dockerContextParserRules` by container image/name matching (Priority 90 -> 10).
 *   3. Strip container-specific comment formats (-- for SQL, # for Redis/Kafka, // for Mongo/JSON) and parse query classification flags (isSql).
 * 
 * Phase 1: Native CLI Command Syntax Transformation (dockerExecRules)
 *   1. Evaluate `dockerExecRules` using `resolveFirstRuleTransform` (Priority 100 -> 10).
 *   2. Transform raw user queries into native CLI binary invocations (psql, mysql, mongosh, redis-cli, kafka-topics.sh, cqlsh, etc.).
 *   3. Inject expanded container PATH environment variables.
 * 
 * Phase 2: Execution Strategy & Error Exit Post-Processing (dockerExecStrategyRules)
 *   1. Evaluate `dockerExecStrategyRules` using `resolveExecutionStrategy` (Priority 100 -> 10).
 *   2. Execute container command via base image strategy (Distroless Direct Exec vs Standard Shell Wrapper).
 *   3. Evaluate container-specific error signatures and return formatted JSON { exitCode, output }.
 */

import { NextResponse } from "next/server";
import { resolveFirstRuleTransform } from "@/core/rules-engine/evaluate";
import { dockerContextParserRules, resolveRuleContext } from "@/features/docker-lab/rules/docker-context-parser.rules";
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
    const ruleContext = resolveRuleContext(dockerContextParserRules, info, command);

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
