import type { OCSPStaplingPolicy, OCSPCompileResult } from "../domain/entities/ocsp-policy.entity";

export interface OCSPRepositoryPort {
  getPolicy(): Promise<OCSPStaplingPolicy>;
  updatePolicy(policy: OCSPStaplingPolicy): Promise<OCSPStaplingPolicy>;
  compileDirectives(proxyTarget: string): Promise<OCSPCompileResult>;
}
