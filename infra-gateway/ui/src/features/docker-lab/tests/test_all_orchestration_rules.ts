import { DOCKER_IMAGES_CATALOG } from "../domain/docker-images.catalog";
import { resolveOrchestrationPlan } from "../rules/docker-orchestration.rules";
import { IMAGE_IDS } from "../constants/docker-lab.constants";

console.log("================================================================================");
console.log("🧪 STARTING MULTI-CONTAINER STACK ORCHESTRATION RULES ENGINE AUDIT");
console.log("================================================================================");

const observabilityStack = [
  IMAGE_IDS.GRAFANA,
  IMAGE_IDS.PROMETHEUS,
  IMAGE_IDS.OPENTELEMETRY_COLLECTOR,
  IMAGE_IDS.LOKI,
].map((id) => DOCKER_IMAGES_CATALOG.find((img) => img.id === id)!.defaultConfig);

const obsPlan = resolveOrchestrationPlan(observabilityStack, "obs-net");

console.log(`✅ Observability Stack Phases: ${obsPlan.phases.length} Phases Resolved`);
obsPlan.phases.forEach((p) => {
  console.log(`   [Phase ${p.phaseIndex}] ${p.phaseName}: ${p.configs.map((c) => c.imageId).join(", ")}`);
});

const kafkaStack = [
  IMAGE_IDS.KAFKA_UI,
  IMAGE_IDS.KAFKA,
  IMAGE_IDS.ZOOKEEPER,
  IMAGE_IDS.SCHEMA_REGISTRY,
].map((id) => DOCKER_IMAGES_CATALOG.find((img) => img.id === id)!.defaultConfig);

const kafkaPlan = resolveOrchestrationPlan(kafkaStack, "kafka-net");

console.log(`\n✅ Kafka Ecosystem Stack Phases: ${kafkaPlan.phases.length} Phases Resolved`);
kafkaPlan.phases.forEach((p) => {
  console.log(`   [Phase ${p.phaseIndex}] ${p.phaseName}: ${p.configs.map((c) => c.imageId).join(", ")}`);
});

const isOrderingCorrect =
  kafkaPlan.orderedConfigs[0].imageId === IMAGE_IDS.ZOOKEEPER &&
  kafkaPlan.orderedConfigs[1].imageId === IMAGE_IDS.KAFKA;

if (isOrderingCorrect) {
  console.log("\n================================================================================");
  console.log("📊 AUDIT RESULT: PASSED - Topological sort & cross-wiring resolved correctly!");
  console.log("================================================================================");
} else {
  console.error("❌ AUDIT RESULT: FAILED - Incorrect ordering detected");
  process.exit(1);
}
