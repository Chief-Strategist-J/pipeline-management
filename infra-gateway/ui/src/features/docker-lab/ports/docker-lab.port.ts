import type {
  ContainerConfig,
  ExecutionResult,
  TestResult,
  LogLine
} from "../domain/entities/docker-image.entity";

export interface DockerLabPort {
  executeImage(config: ContainerConfig): Promise<ExecutionResult>;
  testContainer(containerId: string, probeType?: string, port?: number, path?: string): Promise<TestResult>;
  getLogs(containerId: string): Promise<LogLine[]>;
  stopContainer(containerId: string, backup?: boolean): Promise<boolean>;
  listRunningContainers(): Promise<ExecutionResult[]>;
  execCommand(containerId: string, command: string): Promise<{ exitCode: number; output: string }>;
}
