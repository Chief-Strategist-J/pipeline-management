/**
 * ============================================================================
 * MULTI-IMAGE CONTAINER STACK ORCHESTRATION RULES ENGINE
 * ============================================================================
 * Algorithm Flow:
 * 1. Topological Dependency Matrix Resolution:
 *    - Phase 1: Core Storage & Foundation (Zookeeper, Postgres, MySQL, MongoDB, Redis, InfluxDB, Cassandra)
 *    - Phase 2: Event Streams & Telemetry Storage (Kafka, RabbitMQ, NATS, Prometheus, Jaeger, Tempo, Loki)
 *    - Phase 3: Telemetry Collectors & Registries (OpenTelemetry Collector, Schema Registry, Vector)
 *    - Phase 4: Proxies & Dashboards (Grafana, Kafka UI, Kibana, Nginx, Traefik, Kong, Keycloak)
 * 2. Shared Network Bridge Synthesis:
 *    - Enforces container network bridge (e.g. shared-lab-net) with DNS aliases.
 * 3. Cross-Service Environment Variable Auto-Wiring:
 *    - Injects OTEL_EXPORTER_OTLP_ENDPOINT for Telemetry collectors.
 *    - Injects KAFKA_BOOTSTRAP_SERVERS for Kafka ecosystem.
 *    - Injects PROMETHEUS_URL and GRAFANA_DATASOURCES for Observability stacks.
 * ============================================================================
 */

import { IMAGE_IDS } from "../constants/docker-lab.constants";
import type { ContainerConfig } from "../domain/entities/docker-image.entity";

export interface StackOrchestrationPhase {
  phaseIndex: number;
  phaseName: string;
  description: string;
  configs: ContainerConfig[];
}

export interface OrchestratedStackPlan {
  networkName: string;
  phases: StackOrchestrationPhase[];
  orderedConfigs: ContainerConfig[];
  envOverrides: Record<string, Record<string, string>>;
}

const PHASE_WEIGHTS: Record<string, number> = {
  [IMAGE_IDS.ZOOKEEPER]: 10,
  [IMAGE_IDS.POSTGRES]: 10,
  [IMAGE_IDS.MYSQL]: 10,
  [IMAGE_IDS.MARIADB]: 10,
  [IMAGE_IDS.MONGODB]: 10,
  [IMAGE_IDS.REDIS]: 10,
  [IMAGE_IDS.CASSANDRA]: 10,
  [IMAGE_IDS.COCKROACHDB]: 10,
  [IMAGE_IDS.TIMESCALEDB]: 10,
  [IMAGE_IDS.SCYLLADB]: 10,

  [IMAGE_IDS.KAFKA]: 20,
  [IMAGE_IDS.RABBITMQ]: 20,
  [IMAGE_IDS.NATS]: 20,
  [IMAGE_IDS.PULSAR]: 20,
  [IMAGE_IDS.PROMETHEUS]: 20,
  [IMAGE_IDS.JAEGER]: 20,
  [IMAGE_IDS.TEMPO]: 20,
  [IMAGE_IDS.LOKI]: 20,
  [IMAGE_IDS.ELASTICSEARCH]: 20,

  [IMAGE_IDS.OPENTELEMETRY_COLLECTOR]: 30,
  [IMAGE_IDS.SCHEMA_REGISTRY]: 30,
  [IMAGE_IDS.VECTOR]: 30,
  [IMAGE_IDS.ALERTMANAGER]: 30,

  [IMAGE_IDS.GRAFANA]: 40,
  [IMAGE_IDS.KAFKA_UI]: 40,
  [IMAGE_IDS.KIBANA]: 40,
  [IMAGE_IDS.NGINX]: 40,
  [IMAGE_IDS.TRAEFIK]: 40,
  [IMAGE_IDS.ENVOY]: 40,
  [IMAGE_IDS.KONG]: 40,
};

export function resolveOrchestrationPlan(
  selectedConfigs: ContainerConfig[],
  networkName: string = "shared-lab-net"
): OrchestratedStackPlan {
  const envOverrides: Record<string, Record<string, string>> = {};

  const hasKafka = selectedConfigs.some((c) => c.imageId === IMAGE_IDS.KAFKA);
  const hasOtel = selectedConfigs.some((c) => c.imageId === IMAGE_IDS.OPENTELEMETRY_COLLECTOR);
  const hasPrometheus = selectedConfigs.some((c) => c.imageId === IMAGE_IDS.PROMETHEUS);

  const enrichedConfigs = selectedConfigs.map((cfg) => {
    const copyEnv = [...(cfg.envVars || [])];
    const imageId = cfg.imageId;
    const overrides: Record<string, string> = {};

    if (imageId === IMAGE_IDS.KAFKA_UI && hasKafka) {
      overrides["KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS"] = "kafka:9092";
    }

    if (imageId === IMAGE_IDS.SCHEMA_REGISTRY && hasKafka) {
      overrides["SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS"] = "PLAINTEXT://kafka:9092";
    }

    if (imageId === IMAGE_IDS.GRAFANA) {
      if (hasPrometheus) overrides["GF_PROMETHEUS_URL"] = "http://prometheus:9090";
      if (hasOtel) overrides["GF_OTEL_URL"] = "http://opentelemetry-collector:4318";
    }

    if (imageId === IMAGE_IDS.OPENTELEMETRY_COLLECTOR) {
      overrides["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://opentelemetry-collector:4317";
    }

    Object.entries(overrides).forEach(([key, value]) => {
      const idx = copyEnv.findIndex((e) => e.key === key);
      if (idx >= 0) copyEnv[idx] = { key, value };
      else copyEnv.push({ key, value });
    });

    envOverrides[cfg.imageId] = overrides;

    return {
      ...cfg,
      envVars: copyEnv,
      network: {
        mode: "custom" as const,
        customNetworkName: networkName,
        aliases: [cfg.containerName || cfg.imageId],
      },
    };
  });

  const sorted = [...enrichedConfigs].sort((a, b) => {
    const wA = PHASE_WEIGHTS[a.imageId] || 25;
    const wB = PHASE_WEIGHTS[b.imageId] || 25;
    return wA - wB;
  });

  const phase1 = sorted.filter((c) => (PHASE_WEIGHTS[c.imageId] || 25) <= 10);
  const phase2 = sorted.filter((c) => (PHASE_WEIGHTS[c.imageId] || 25) === 20);
  const phase3 = sorted.filter((c) => (PHASE_WEIGHTS[c.imageId] || 25) === 30);
  const phase4 = sorted.filter((c) => (PHASE_WEIGHTS[c.imageId] || 25) >= 40);

  const phases: StackOrchestrationPhase[] = [
    {
      phaseIndex: 1,
      phaseName: "Phase 1: Datastores & Storage Foundation",
      description: "Core database engines, caches, and metadata storage nodes.",
      configs: phase1,
    },
    {
      phaseIndex: 2,
      phaseName: "Phase 2: Event Streams & Telemetry Storage",
      description: "Message brokers, event buses, and time-series backends.",
      configs: phase2,
    },
    {
      phaseIndex: 3,
      phaseName: "Phase 3: Telemetry Collectors & Registries",
      description: "OpenTelemetry collectors, schema registries, and log agents.",
      configs: phase3,
    },
    {
      phaseIndex: 4,
      phaseName: "Phase 4: Proxies, Identity & Dashboards",
      description: "Visualization UIs, API gateways, and auth services.",
      configs: phase4,
    },
  ].filter((p) => p.configs.length > 0);

  return {
    networkName,
    phases,
    orderedConfigs: sorted,
    envOverrides,
  };
}
