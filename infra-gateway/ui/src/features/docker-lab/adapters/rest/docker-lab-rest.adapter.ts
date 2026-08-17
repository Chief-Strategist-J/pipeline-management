import { httpClient } from "@/core/http/http-client";
import type { DockerLabPort } from "../../ports/docker-lab.port";
import type {
  ContainerConfig,
  ExecutionResult,
  TestResult,
  LogLine
} from "../../domain/entities/docker-image.entity";

export class DockerLabRestAdapter implements DockerLabPort {
  async executeImage(config: ContainerConfig): Promise<ExecutionResult> {
    return await httpClient.post<ExecutionResult>("/api/docker-lab/execute", { config });
  }

  async testContainer(containerId: string, probeType: string = "tcp", port?: number, path?: string): Promise<TestResult> {
    return await httpClient.post<TestResult>("/api/docker-lab/test", { containerId, probeType, port, path });
  }

  async getLogs(containerId: string): Promise<LogLine[]> {
    return await httpClient.get<LogLine[]>(`/api/docker-lab/logs?containerId=${containerId}`);
  }

  async stopContainer(containerId: string, backup: boolean = false): Promise<boolean> {
    const res = await httpClient.delete<{ success: boolean; backupPath?: string }>(
      `/api/docker-lab/containers?containerId=${containerId}&backup=${backup}`
    );
    return res.success;
  }

  async listRunningContainers(): Promise<ExecutionResult[]> {
    return await httpClient.get<ExecutionResult[]>("/api/docker-lab/containers");
  }

  async execCommand(containerId: string, command: string): Promise<{ exitCode: number; output: string }> {
    return await httpClient.post<{ exitCode: number; output: string }>("/api/docker-lab/exec", { containerId, command });
  }

  async checkDockerStatus(): Promise<{ available: boolean; version?: string; error?: string }> {
    return await httpClient.get<{ available: boolean; version?: string; error?: string }>("/api/docker-lab/status");
  }

  async installDocker(): Promise<{ success: boolean; output: string }> {
    return await httpClient.post<{ success: boolean; output: string }>("/api/docker-lab/status", { action: "install" });
  }
}
