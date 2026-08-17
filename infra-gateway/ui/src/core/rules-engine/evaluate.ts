import type { Rule, RuleContext } from "./rule.types";

export async function evaluateRules(rules: Rule[], ctx: RuleContext): Promise<Rule[]> {
  const activeRules = rules
    .filter((r) => r.enabled)
    .sort((a, b) => b.priority - a.priority);

  const matchedRules: Rule[] = [];

  for (const rule of activeRules) {
    let matches = false;
    try {
      matches = rule.condition(ctx);
      if (matches && rule.asyncCheck) {
        matches = await rule.asyncCheck(ctx);
      }
    } catch {
      matches = false;
    }

    if (matches) {
      matchedRules.push(rule);
    }
  }

  return matchedRules;
}

export async function resolveFirstRuleTransform(rules: Rule[], ctx: RuleContext, fallback?: string): Promise<string> {
  const matched = await evaluateRules(rules, ctx);
  if (matched.length > 0) {
    return matched[0].transform(ctx);
  }
  return fallback ?? ctx.rawCommand;
}
