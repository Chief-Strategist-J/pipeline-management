/**
 * Core Rules Engine Evaluator
 * 
 * ALGORITHM / EXECUTION FLOW:
 * 1. Filter out disabled rules (rule.enabled === true).
 * 2. Sort remaining candidate rules in descending order of priority (e.g., 100 -> 90 -> 10).
 * 3. Iterate through sorted rules:
 *    a. Execute synchronous rule.condition(ctx).
 *    b. If condition passes and rule.asyncCheck exists, await rule.asyncCheck(ctx).
 *    c. If matched, push rule to matchedRules array.
 * 4. Return array of matched rules.
 * 5. resolveFirstRuleTransform selects highest-priority matching rule and applies rule.transform(ctx).
 */

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
