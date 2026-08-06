import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

const POLICY_PATH = path.resolve(process.cwd(), "../edge/tls/ocsp-stapling-policy");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  try {
    let rawContent = "";
    if (fs.existsSync(POLICY_PATH)) {
      rawContent = fs.readFileSync(POLICY_PATH, "utf-8");
    }

    const doc = (yaml.load(rawContent) as Record<string, any>) || {};

    const policy = {
      enabled: Boolean(doc.ocsp_stapling?.enabled ?? true),
      verify: Boolean(doc.ocsp_stapling?.verify ?? true),
      resolver: {
        nameservers: doc.resolver?.nameservers || ["8.8.8.8", "8.8.4.4"],
        validDuration: String(doc.resolver?.valid_duration || "300s"),
        timeout: String(doc.resolver?.timeout || "5s"),
      },
      cache: {
        type: doc.cache?.type || "shared",
        sharedZoneName: String(doc.cache?.shared_zone_name || "ocsp_cache"),
        sharedZoneSize: String(doc.cache?.shared_zone_size || "10m"),
        filePath: String(doc.cache?.file_path || "/var/cache/nginx/ocsp"),
      },
      responder: {
        overrideUrl: String(doc.responder?.override_url || ""),
        trustedCertificate: String(doc.responder?.trusted_certificate || ""),
      },
    };

    if (target) {
      let directives = "";
      if (policy.enabled) {
        if (target === "nginx") {
          directives = `ssl_stapling on;\n`;
          if (policy.verify) directives += `ssl_stapling_verify on;\n`;
          directives += `resolver ${policy.resolver.nameservers.join(" ")} valid=${policy.resolver.validDuration};\n`;
          directives += `resolver_timeout ${policy.resolver.timeout};\n`;
          directives += `ssl_ocsp_cache shared:${policy.cache.sharedZoneName}:${policy.cache.sharedZoneSize};`;
        } else if (target === "traefik") {
          directives = `ocsp_stapling: true\nocsp_stapling_verify: ${policy.verify}`;
        } else if (target === "apache") {
          const bytes = policy.cache.sharedZoneSize.endsWith("m")
            ? parseInt(policy.cache.sharedZoneSize) * 1024 * 1024
            : 10485760;
          directives = `SSLUseStapling On\nSSLStaplingResponderTimeout ${policy.resolver.timeout.replace("s", "")}\nSSLStaplingReturnResponderErrors Off\nSSLStaplingCache "shmcb:/var/run/ocsp(${bytes})"`;
        }
      }
      return NextResponse.json({
        proxyTarget: target,
        directives,
        enabled: policy.enabled,
      });
    }

    return NextResponse.json(policy);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const yamlObj = {
      ocsp_stapling: {
        enabled: body.enabled,
        verify: body.verify,
      },
      resolver: {
        nameservers: body.resolver.nameservers,
        valid_duration: body.resolver.validDuration,
        timeout: body.resolver.timeout,
      },
      cache: {
        type: body.cache.type,
        shared_zone_name: body.cache.sharedZoneName,
        shared_zone_size: body.cache.sharedZoneSize,
        file_path: body.cache.filePath,
      },
      responder: {
        override_url: body.responder.overrideUrl,
        trusted_certificate: body.responder.trustedCertificate,
      },
    };

    const yamlString = yaml.dump(yamlObj);
    fs.writeFileSync(POLICY_PATH, yamlString, "utf-8");

    return NextResponse.json(body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
