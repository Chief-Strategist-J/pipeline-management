import { z } from "zod";
import { httpClient } from "@/core/http/http-client";
import type { CompilerRepositoryPort } from "../../ports/compiler-repository.port";
import type { CompiledOutput } from "../../domain/entities/compiler.entity";

const CompiledOutputSchema = z.object({
  target: z.string(),
  files: z.array(
    z.object({
      filename: z.string(),
      path: z.string(),
      content: z.string(),
      proxyType: z.string(),
    })
  ),
  timestamp: z.string(),
  syntaxValid: z.boolean(),
});

export class CompilerRestAdapter implements CompilerRepositoryPort {
  async compile(target: string): Promise<CompiledOutput> {
    const data = await httpClient.post<unknown>("/api/compile", { proxy: target });
    return CompiledOutputSchema.parse(data);
  }
}
