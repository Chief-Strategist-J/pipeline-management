import { z } from "zod";
import { httpClient } from "@/core/http/http-client";
import type { SandboxRepositoryPort } from "../../ports/sandbox-repository.port";
import type { Sandbox, CreateSandboxPayload } from "../../domain/entities/sandbox.entity";

const SandboxSchema = z.object({
  sandboxId: z.string(),
  name: z.string(),
  status: z.enum(["provisioning", "active", "failed", "terminated"]),
  namespace: z.string(),
  isolatedNetwork: z.boolean(),
  mockDependencies: z.array(z.string()),
  createdAt: z.string(),
});

export class SandboxRestAdapter implements SandboxRepositoryPort {
  async listSandboxes(): Promise<Sandbox[]> {
    const data = await httpClient.get<unknown>("/api/sandbox");
    return z.array(SandboxSchema).parse(data);
  }

  async createSandbox(payload: CreateSandboxPayload): Promise<Sandbox> {
    const data = await httpClient.post<unknown>("/api/sandbox", payload);
    return SandboxSchema.parse(data);
  }

  async destroySandbox(sandboxId: string): Promise<boolean> {
    const res = await httpClient.delete<{ success: boolean }>(`/api/sandbox?id=${sandboxId}`);
    return res.success;
  }
}
