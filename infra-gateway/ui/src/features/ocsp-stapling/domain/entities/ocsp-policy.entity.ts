export interface OCSPResolverConfig {
  nameservers: string[];
  validDuration: string;
  timeout: string;
}

export interface OCSPCacheConfig {
  type: "shared" | "file";
  sharedZoneName: string;
  sharedZoneSize: string;
  filePath: string;
}

export interface OCSPResponderConfig {
  overrideUrl: string;
  trustedCertificate: string;
}

export interface OCSPStaplingPolicy {
  enabled: boolean;
  verify: boolean;
  resolver: OCSPResolverConfig;
  cache: OCSPCacheConfig;
  responder: OCSPResponderConfig;
}

export interface OCSPCompileResult {
  proxyTarget: "nginx" | "traefik" | "apache" | string;
  directives: string;
  enabled: boolean;
}
