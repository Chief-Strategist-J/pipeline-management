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
