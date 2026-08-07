import { z } from "zod";
import { registerEntity } from "@/core/data-driven/register-entity";

export const compilerSchema = {
  name: "compiler",
  endpoint: "/api/compile",
  schema: z.object({
    target: z.string(),
    files: z.array(z.object({ filename: z.string(), path: z.string(), content: z.string(), proxyType: z.string() })),
    timestamp: z.string(),
    syntaxValid: z.boolean(),
  }),
};

export const compilerFeature = registerEntity(compilerSchema);
export { compilerFeatureConfig } from "./feature.config";
export { compilerSlice } from "./state/compiler.slice";
export { rootCompilerSaga } from "./application/sagas";
export { ProxyCompilerView } from "./ui/components/ProxyCompilerView";
export { CodeDiffViewer } from "./ui/components/CodeDiffViewer";
export { useCompiler } from "./ui/hooks/useCompiler";
export type { CompiledOutput } from "./domain/entities/compiler.entity";
