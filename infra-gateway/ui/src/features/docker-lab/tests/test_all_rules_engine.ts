import { DOCKER_IMAGES_CATALOG } from "../domain/docker-images.catalog";
import { dockerContextParserRules, resolveRuleContext } from "../rules/docker-context-parser.rules";
import { dockerExecRules } from "../rules/docker-exec.rules";
import { dockerExecStrategyRules } from "../rules/docker-exec-strategy.rules";
import { resolveFirstRuleTransform } from "@/core/rules-engine/evaluate";

async function runFullRulesEngineAudit() {
  console.log("================================================================================");
  console.log("🧪 STARTING COMPREHENSIVE 3-PHASE RULES ENGINE AUDIT ACROSS ALL 53 CATALOG IMAGES");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  for (const imgConfig of DOCKER_IMAGES_CATALOG) {
    try {
      const containerInfo = {
        name: `dlab-${imgConfig.id}-test`,
        image: imgConfig.image,
        env: {
          POSTGRES_USER: "postgres",
          POSTGRES_DB: "prod_db",
          MYSQL_USER: "root",
          MYSQL_PASSWORD: "secretpass",
          MYSQL_DATABASE: "test_db",
          MONGO_INITDB_ROOT_USERNAME: "admin",
          MONGO_INITDB_ROOT_PASSWORD: "secretpass",
        },
      };

      const sampleCmd = imgConfig.category === "Databases"
        ? "SELECT 1;"
        : imgConfig.id.includes("redis")
        ? "PING"
        : imgConfig.id.includes("mongo")
        ? "show dbs"
        : imgConfig.id.includes("kafka")
        ? "kafka-topics.sh --list"
        : "status";

      // Phase 0: Context Parsing
      const ruleContext = resolveRuleContext(dockerContextParserRules, containerInfo, sampleCmd);
      if (!ruleContext || !ruleContext.containerName) {
        throw new Error("Phase 0 Context Parser returned empty context");
      }

      // Phase 1: Command Transformation
      const transformedCmd = await resolveFirstRuleTransform(dockerExecRules, ruleContext);
      if (!transformedCmd) {
        throw new Error("Phase 1 Command Transformation returned empty command");
      }

      // Phase 2: Execution Strategy Selection
      const strategyRule = dockerExecStrategyRules
        .filter((r) => r.enabled)
        .sort((a, b) => b.priority - a.priority)
        .find((r) => r.condition(ruleContext));

      if (!strategyRule) {
        throw new Error("Phase 2 Execution Strategy failed to match any strategy rule");
      }

      console.log(`✅ [${imgConfig.id.padEnd(25)}] P0: OK | P1: ${transformedCmd.substring(0, 45).padEnd(45)} | Strategy: ${strategyRule.id}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [${imgConfig.id.padEnd(25)}] FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log("\n================================================================================");
  console.log(`📊 FINAL TEST AUDIT SUMMARY: Total: ${DOCKER_IMAGES_CATALOG.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFullRulesEngineAudit();
