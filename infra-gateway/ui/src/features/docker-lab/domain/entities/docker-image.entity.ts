export interface PortMapping {
  hostPort: number;
  containerPort: number;
  protocol: "tcp" | "udp";
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface VolumeMount {
  hostPath: string;
  containerPath: string;
  mode: "rw" | "ro";
}

export interface ResourceLimits {
  cpus: string;
  memoryMb: number;
}

export type NetworkMode = "bridge" | "host" | "none" | "custom";

export interface NetworkConfig {
  mode: NetworkMode;
  customNetworkName?: string;
  aliases?: string[];
}

export interface ContainerConfig {
  imageId: string;
  tag: string;
  containerName?: string;
  ports: PortMapping[];
  envVars: EnvVar[];
  volumes: VolumeMount[];
  network: NetworkConfig;
  replicas: number;
  resources: ResourceLimits;
  restartPolicy: "no" | "always" | "on-failure" | "unless-stopped";
  customCommand?: string;
  labels: EnvVar[];
}

export interface RunningContainer {
  containerId: string;
  containerName: string;
  replicaIndex: number;
  status: "starting" | "running" | "exited" | "error";
  ports: string[];
}

export interface ExecutionResult {
  imageId: string;
  containers: RunningContainer[];
  startedAt: string;
  error?: string;
}

export interface TestResult {
  containerId: string;
  healthy: boolean;
  latencyMs: number;
  probeType: "tcp" | "http" | "exec";
  probeOutput: string;
  testedAt: string;
}

export interface LogLine {
  containerId: string;
  timestamp: string;
  stream: "stdout" | "stderr";
  message: string;
}

export type ImageCategory =
  | "Databases"
  | "Messaging & Streaming"
  | "Observability & Tracing"
  | "Search Engines"
  | "Proxy & Gateway"
  | "Security & Identity"
  | "Dev & Infrastructure"
  | "AI & Vector DBs";

export interface DockerImage {
  id: string;
  name: string;
  image: string;
  defaultTag: string;
  category: ImageCategory;
  description: string;
  icon: string;
  officialUrl: string;
  defaultConfig: ContainerConfig;
  healthProbe: {
    type: "tcp" | "http" | "exec";
    port?: number;
    path?: string;
    command?: string[];
  };
}

export interface ExecuteImagePayload {
  config: ContainerConfig;
}

export interface TestContainerPayload {
  containerId: string;
  probeType: "tcp" | "http" | "exec";
  port?: number;
  path?: string;
  command?: string[];
}

export interface StopContainerPayload {
  containerId: string;
}
