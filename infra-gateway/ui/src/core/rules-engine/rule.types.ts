export type RuleCategory = "security" | "routing" | "transform" | "validation";

export interface RuleContext {
  containerName: string;
  image: string;
  env: Record<string, string>;
  rawCommand: string;
  codeLines: string;
  isSql: boolean;
}

export type RuleConditionFn = (ctx: RuleContext) => boolean;
export type RuleTransformFn = (ctx: RuleContext) => string;

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  priority: number;
  enabled: boolean;
  condition: RuleConditionFn;
  asyncCheck?: (ctx: RuleContext) => Promise<boolean>;
  transform: RuleTransformFn;
}
