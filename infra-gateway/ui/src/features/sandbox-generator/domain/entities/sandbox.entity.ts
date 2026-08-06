export interface Sandbox {
  sandboxId: string;
  name: string;
  status: "provisioning" | "active" | "failed" | "terminated";
  namespace: string;
  isolatedNetwork: boolean;
  mockDependencies: string[];
  createdAt: string;
}

export interface CreateSandboxPayload {
  name: string;
  isolatedNetwork: boolean;
  mockDependencies: string[];
}
