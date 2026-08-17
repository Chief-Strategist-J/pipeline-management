import type { ImageId, CategoryKind } from "../../constants/docker-lab.constants";

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
  replicaIndex?: number;
  status: "starting" | "running" | "exited" | "error";
  ports: string[];
  imageId?: string;
  error?: string;
}

export interface ExecutionResult {
  imageId?: string;
  containers: RunningContainer[];
  startedAt?: string;
  networkName?: string;
  error?: string;
}

export interface TestResult {
  containerId: string;
  success: boolean;
  healthy?: boolean;
  probeOutput?: string;
  message: string;
  latencyMs: number;
  testedAt: string;
}

export interface LogLine {
  timestamp: string;
  stream: "stdout" | "stderr";
  message: string;
  line?: string;
}

export interface HealthProbe {
  type: "http" | "tcp" | "exec";
  port?: number;
  path?: string;
  command?: string;
}

export interface DockerImage {
  id: string;
  name: string;
  category: string;
  image: string;
  defaultTag: string;
  description: string;
  icon: string;
  badge?: string;
  defaultPort?: number;
  officialUrl?: string;
  envVars?: any;
  ports?: any;
  volumes?: any;
  healthProbe?: HealthProbe;
  defaultConfig: ContainerConfig;
}

export class DockerImageEntity implements DockerImage {
  id!: string;
  name!: string;
  category!: string;
  image!: string;
  defaultTag!: string;
  description!: string;
  icon!: string;
  badge?: string;
  defaultPort?: number;
  officialUrl?: string;
  envVars?: any;
  ports?: any;
  volumes?: any;
  healthProbe?: HealthProbe;

  get defaultConfig(): ContainerConfig {
    const port = this.defaultPort || 8080;
    const envList: EnvVar[] = Array.isArray(this.envVars)
      ? this.envVars
      : this.envVars
      ? Object.entries(this.envVars).map(([key, value]) => ({ key, value: String(value) }))
      : [];

    return {
      imageId: this.id,
      tag: this.defaultTag || "latest",
      containerName: `${this.id}-node`,
      ports: [{ hostPort: port, containerPort: port, protocol: "tcp" }],
      envVars: envList,
      volumes: [],
      network: { mode: "bridge" },
      replicas: 1,
      resources: { cpus: "1.0", memoryMb: 512 },
      restartPolicy: "unless-stopped",
      labels: [],
    };
  }

  static create(data: Record<string, any>): DockerImageEntity {
    const entity = new DockerImageEntity();
    Object.assign(entity, data);
    return entity;
  }
}
