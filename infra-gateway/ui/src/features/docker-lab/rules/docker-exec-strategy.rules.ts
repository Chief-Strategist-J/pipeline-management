import type { RuleContext } from "@/core/rules-engine/rule.types";
import { runCmd } from "../utils/exec.utils";

export interface ExecutionStrategyResult {
  stdout: string;
  stderr: string;
  isErrorExit: boolean;
  output: string;
}

export interface ExecutionStrategyRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  condition: (ctx: RuleContext) => boolean;
  execute: (ctx: RuleContext, containerId: string, finalCmd: string) => Promise<ExecutionStrategyResult>;
}

export const dockerExecStrategyRules: ExecutionStrategyRule[] = [
  {
    id: "rule-strategy-distroless",
    name: "Distroless Image Direct Execution Strategy",
    priority: 100,
    enabled: true,
    condition: (ctx) => {
      const name = ctx.containerName.toLowerCase();
      const img = ctx.image.toLowerCase();
      return name.includes("surreal") || img.includes("surreal") || name.includes("kratos") || img.includes("kratos");
    },
    execute: async (_ctx, containerId, finalCmd) => {
      const { stdout, stderr } = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isErrorExit = Boolean(stderr && !stdout && (stderr.includes("Error:") || stderr.includes("command not found")));
      return { stdout, stderr, isErrorExit, output: combined || "(Command executed with no output)" };
    },
  },
  {
    id: "rule-strategy-standard-shell",
    name: "Standard Shell Execution Strategy with Fallback",
    priority: 10,
    enabled: true,
    condition: () => true,
    execute: async (_ctx, containerId, finalCmd) => {
      const jsonCmd = JSON.stringify(finalCmd);
      let { stdout, stderr } = await runCmd(`docker exec ${containerId} sh -c ${jsonCmd}`, 25000);

      if (!stdout && stderr && (stderr.includes("executable file not found") || stderr.includes("no such file"))) {
        const retryRes = await runCmd(`docker exec ${containerId} ${finalCmd}`, 25000);
        stdout = retryRes.stdout;
        stderr = retryRes.stderr;
      }

      const combined = [stdout, stderr].map((s) => (s || "").trim()).filter(Boolean).join("\n");
      const isErrorExit = Boolean(
        stderr &&
        !stdout &&
        (stderr.includes("Error:") || stderr.includes("No such container") || stderr.includes("command not found") || stderr.includes("psql: error:"))
      );

      return { stdout, stderr, isErrorExit, output: combined || "(Command executed with no output)" };
    },
  },
];

export async function resolveExecutionStrategy(
  rules: ExecutionStrategyRule[],
  ctx: RuleContext,
  containerId: string,
  finalCmd: string
): Promise<ExecutionStrategyResult> {
  const active = rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
  for (const rule of active) {
    if (rule.condition(ctx)) {
      return await rule.execute(ctx, containerId, finalCmd);
    }
  }
  return dockerExecStrategyRules[dockerExecStrategyRules.length - 1].execute(ctx, containerId, finalCmd);
}
