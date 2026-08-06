import type { OCSPRepositoryPort } from "../../ports/ocsp-repository.port";
import type { OCSPStaplingPolicy, OCSPCompileResult } from "../../domain/entities/ocsp-policy.entity";

export const defaultMockPolicy: OCSPStaplingPolicy = {
  enabled: true,
  verify: true,
  resolver: {
    nameservers: ["8.8.8.8", "8.8.4.4"],
    validDuration: "300s",
    timeout: "5s",
  },
  cache: {
    type: "shared",
    sharedZoneName: "ocsp_cache",
    sharedZoneSize: "10m",
    filePath: "/var/cache/nginx/ocsp",
  },
  responder: {
    overrideUrl: "",
    trustedCertificate: "",
  },
};

export class OCSPMockAdapter implements OCSPRepositoryPort {
  private policy: OCSPStaplingPolicy = { ...defaultMockPolicy };

  async getPolicy(): Promise<OCSPStaplingPolicy> {
    return { ...this.policy };
  }

  async updatePolicy(policy: OCSPStaplingPolicy): Promise<OCSPStaplingPolicy> {
    this.policy = { ...policy };
    return { ...this.policy };
  }

  async compileDirectives(proxyTarget: string): Promise<OCSPCompileResult> {
    if (!this.policy.enabled) {
      return { proxyTarget, directives: "", enabled: false };
    }

    if (proxyTarget === "nginx") {
      return {
        proxyTarget: "nginx",
        directives: `ssl_stapling on;\nssl_stapling_verify on;\nresolver 8.8.8.8 8.8.4.4 valid=300s;\nresolver_timeout 5s;\nssl_ocsp_cache shared:ocsp_cache:10m;`,
        enabled: true,
      };
    }
    if (proxyTarget === "traefik") {
      return {
        proxyTarget: "traefik",
        directives: `ocsp_stapling: true\nocsp_stapling_verify: true`,
        enabled: true,
      };
    }
    if (proxyTarget === "apache") {
      return {
        proxyTarget: "apache",
        directives: `SSLUseStapling On\nSSLStaplingResponderTimeout 5\nSSLStaplingReturnResponderErrors Off\nSSLStaplingCache "shmcb:/var/run/ocsp(10485760)"`,
        enabled: true,
      };
    }

    return { proxyTarget, directives: "", enabled: false };
  }
}
