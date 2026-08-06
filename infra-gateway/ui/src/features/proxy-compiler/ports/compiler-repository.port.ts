import type { CompiledOutput } from "../domain/entities/compiler.entity";

export interface CompilerRepositoryPort {
  compile(target: string): Promise<CompiledOutput>;
}
