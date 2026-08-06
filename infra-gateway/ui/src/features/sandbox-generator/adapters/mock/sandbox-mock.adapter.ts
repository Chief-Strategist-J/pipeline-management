import type { SandboxRepositoryPort } from "../../ports/sandbox-repository.port";
import type { Sandbox, CreateSandboxPayload } from "../../domain/entities/sandbox.entity";

export class SandboxMockAdapter implements SandboxRepositoryPort {
  private sandboxes: Sandbox[] = [
    {
      sandboxId: "sbx-8f92a10",
      name: "integration-test-env-1",
      status: "active",
      namespace: "sandbox-sbx-8f92a10",
      isolatedNetwork: true,
      mockDependencies: ["redis", "postgres"],
      createdAt: new Date().toISOString(),
    },
  ];

  async listSandboxes(): Promise<Sandbox[]> {
    return [...this.sandboxes];
  }

  async createSandbox(payload: CreateSandboxPayload): Promise<Sandbox> {
    const id = `sbx-${Math.random().toString(16).substring(2, 9)}`;
    const newSb: Sandbox = {
      sandboxId: id,
      name: payload.name,
      status: "active",
      namespace: `sandbox-${id}`,
      isolatedNetwork: payload.isolatedNetwork,
      mockDependencies: payload.mockDependencies,
      createdAt: new Date().toISOString(),
    };
    this.sandboxes.push(newSb);
    return newSb;
  }

  async destroySandbox(sandboxId: string): Promise<boolean> {
    const initialLen = this.sandboxes.length;
    this.sandboxes = this.sandboxes.filter((s) => s.sandboxId !== sandboxId);
    return this.sandboxes.length < initialLen;
  }
}
