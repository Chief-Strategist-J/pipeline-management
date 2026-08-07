import { z } from "zod";
import { registerEntity } from "@/core/data-driven/register-entity";

export const ocspSchema = {
  name: "ocsp",
  endpoint: "/api/ocsp",
  schema: z.object({
    enabled: z.boolean(),
    verify: z.boolean(),
    resolver: z.object({ nameservers: z.array(z.string()), validDuration: z.string(), timeout: z.string() }),
    cache: z.object({ type: z.enum(["shared", "file"]), sharedZoneName: z.string(), sharedZoneSize: z.string(), filePath: z.string() }),
    responder: z.object({ overrideUrl: z.string(), trustedCertificate: z.string() }),
  }),
};

export const ocspFeature = registerEntity(ocspSchema);
export { ocspFeatureConfig } from "./feature.config";
export { ocspSlice } from "./state/ocsp.slice";
export { rootOCSPSaga } from "./application/sagas";
export { OCSPControlPanel } from "./ui/components/OCSPControlPanel";
export { DirectiveCompilerPreview } from "./ui/components/DirectiveCompilerPreview";
export { useOCSP } from "./ui/hooks/useOCSP";
export type { OCSPStaplingPolicy, OCSPCompileResult } from "./domain/entities/ocsp-policy.entity";
