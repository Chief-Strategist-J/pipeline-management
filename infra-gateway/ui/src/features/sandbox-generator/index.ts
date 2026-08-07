import { z } from "zod";
import { registerEntity } from "@/core/data-driven/register-entity";

export const sandboxSchema = {
  name: "sandbox",
  endpoint: "/api/sandbox",
  schema: z.object({
    sandboxId: z.string(),
    name: z.string(),
    status: z.enum(["provisioning", "active", "failed", "terminated"]),
    namespace: z.string(),
    isolatedNetwork: z.boolean(),
    mockDependencies: z.array(z.string()),
    createdAt: z.string(),
  }),
};

export const sandboxFeature = registerEntity(sandboxSchema);
export { sandboxFeatureConfig } from "./feature.config";
export { sandboxSlice } from "./state/sandbox.slice";
export { rootSandboxSaga } from "./application/sagas";
export { SandboxManager } from "./ui/components/SandboxManager";
export { CreateSandboxModal } from "./ui/components/CreateSandboxModal";
export { useSandbox } from "./ui/hooks/useSandbox";
export type { Sandbox, CreateSandboxPayload } from "./domain/entities/sandbox.entity";
