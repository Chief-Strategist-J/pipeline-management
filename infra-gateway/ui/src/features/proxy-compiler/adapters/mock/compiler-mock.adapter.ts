import type { CompilerRepositoryPort } from "../../ports/compiler-repository.port";
import type { CompiledOutput } from "../../domain/entities/compiler.entity";

export class CompilerMockAdapter implements CompilerRepositoryPort {
  async compile(target: string): Promise<CompiledOutput> {
    const timestamp = new Date().toISOString();
    return {
      target,
      timestamp,
      syntaxValid: true,
      files: [
        {
          filename: "nginx.conf",
          path: "runtime-adapters/nginx/nginx.conf",
          proxyType: "nginx",
          content: `# Generated Nginx Configuration\nevents { worker_connections 1024; }\nhttp {\n    ssl_stapling on;\n    ssl_stapling_verify on;\n    ssl_ocsp_cache shared:ocsp_cache:10m;\n}`,
        },
        {
          filename: "traefik.yaml",
          path: "runtime-adapters/traefik/traefik.yaml",
          proxyType: "traefik",
          content: `# Generated Traefik Dynamic YAML\nhttp:\n  routers:\n    app-router:\n      tls:\n        ocspStapling: true`,
        },
        {
          filename: "httpd.conf",
          path: "runtime-adapters/apache/httpd.conf",
          proxyType: "apache",
          content: `# Generated Apache Configuration\nLoadModule socache_shmcb_module modules/mod_socache_shmcb.so\nSSLUseStapling On\nSSLStaplingCache "shmcb:/var/run/ocsp(10485760)"`,
        },
      ],
    };
  }
}
