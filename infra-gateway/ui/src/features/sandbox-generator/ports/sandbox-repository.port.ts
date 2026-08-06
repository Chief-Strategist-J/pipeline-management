import type { Sandbox, CreateSandboxPayload } from "../domain/entities/sandbox.entity";

export interface SandboxRepositoryPort {
  listSandboxes(): Promise<Sandbox[]>;
  createSandbox(payload: CreateSandboxPayload): Promise<Sandbox>;
  destroySandbox(sandboxId: string): Promise<boolean>;
}
