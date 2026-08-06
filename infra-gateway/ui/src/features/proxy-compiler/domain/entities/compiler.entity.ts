export interface CompiledOutput {
  target: "all" | "nginx" | "traefik" | "apache" | string;
  files: {
    filename: string;
    path: string;
    content: string;
    proxyType: string;
  }[];
  timestamp: string;
  syntaxValid: boolean;
}
