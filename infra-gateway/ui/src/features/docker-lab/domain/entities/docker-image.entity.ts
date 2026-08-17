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
  line?: string;
  message: string;
}

export interface HealthProbe {
  type: "tcp" | "http";
  port: number;
  path?: string;
}

export interface DockerImage {
  id: string;
  name: string;
  image: string;
  defaultTag: string;
  category: string;
  description: string;
  icon: string;
  officialUrl: string;
  defaultConfig: ContainerConfig;
  healthProbe?: HealthProbe;
}

export interface CreateDockerImageParams {
  id: string;
  name: string;
  image: string;
  defaultTag: string;
  category: string;
  description: string;
  icon: string;
  defaultPort: number;
  envVars?: EnvVar[];
  volumes?: VolumeMount[];
  healthProbe?: HealthProbe;
}

export class DockerImageEntity implements DockerImage {
  public readonly id: string;
  public readonly name: string;
  public readonly image: string;
  public readonly defaultTag: string;
  public readonly category: string;
  public readonly description: string;
  public readonly icon: string;
  public readonly officialUrl: string;
  public readonly defaultConfig: ContainerConfig;
  public readonly healthProbe?: HealthProbe;

  constructor(params: CreateDockerImageParams) {
    this.id = params.id;
    this.name = params.name;
    this.image = params.image;
    this.defaultTag = params.defaultTag;
    this.category = params.category;
    this.description = params.description;
    this.icon = params.icon;
    this.officialUrl = params.image.includes("/")
      ? `https://hub.docker.com/r/${params.image}`
      : `https://hub.docker.com/_/${params.image}`;

    this.defaultConfig = {
      imageId: params.id,
      tag: params.defaultTag,
      ports: params.defaultPort ? [{ hostPort: params.defaultPort, containerPort: params.defaultPort, protocol: "tcp" }] : [],
      envVars: params.envVars || [],
      volumes: params.volumes || [],
      network: { mode: "bridge" },
      replicas: 1,
      resources: { cpus: "1.0", memoryMb: 1024 },
      restartPolicy: "unless-stopped",
      labels: [{ key: "managed-by", value: "infra-gateway-docker-lab" }],
    };

    this.healthProbe = params.healthProbe || { type: "tcp", port: params.defaultPort };
  }

  public static create(params: CreateDockerImageParams): DockerImageEntity {
    return new DockerImageEntity(params);
  }
}
