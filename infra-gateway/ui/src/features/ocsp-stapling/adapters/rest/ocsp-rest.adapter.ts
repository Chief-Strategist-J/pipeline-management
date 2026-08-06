import { z } from "zod";
import { httpClient } from "@/core/http/http-client";
import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import type { OCSPStaplingPolicy, OCSPCompileResult } from "../../domain/entities/ocsp-policy.entity";

const PolicySchema = z.object({
  enabled: z.boolean(),
  verify: z.boolean(),
  resolver: z.object({
    nameservers: z.array(z.string()),
    validDuration: z.string(),
    timeout: z.string(),
  }),
  cache: z.object({
    type: z.enum(["shared", "file"]),
    sharedZoneName: z.string(),
    sharedZoneSize: z.string(),
    filePath: z.string(),
  }),
  responder: z.object({
    overrideUrl: z.string(),
    trustedCertificate: z.string(),
  }),
});

const CompileResultSchema = z.object({
  proxyTarget: z.string(),
  directives: z.string(),
  enabled: z.boolean(),
});

export class OCSPRestAdapter implements OCSPRepositoryPort {
  async getPolicy(): Promise<OCSPStaplingPolicy> {
    const data = await httpClient.get<unknown>("/api/ocsp");
    return PolicySchema.parse(data);
  }

  async updatePolicy(policy: OCSPStaplingPolicy): Promise<OCSPStaplingPolicy> {
    const data = await httpClient.post<unknown>("/api/ocsp", policy);
    return PolicySchema.parse(data);
  }

  async compileDirectives(proxyTarget: string): Promise<OCSPCompileResult> {
    const data = await httpClient.get<unknown>(`/api/ocsp?target=${proxyTarget}`);
    return CompileResultSchema.parse(data);
  }
}
