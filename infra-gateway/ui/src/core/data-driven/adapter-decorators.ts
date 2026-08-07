import { tracer } from "../tracing/tracer";
import type { CrudPort } from "./create-entity-adapter";

export function withTracing<T>(adapter: CrudPort<T>, entityName: string): CrudPort<T> {
  const wrap = (fn: Function, op: string) => (...args: any[]) =>
    tracer.startActiveSpan(`${entityName}.${op}`, async (span) => {
      span.setAttribute("entity.name", entityName);
      span.setAttribute("entity.op", op);
      try {
        const result = await fn(...args);
        span.setStatus({ code: 1 });
        return result;
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({ code: 2, message: String(e) });
        throw e;
      } finally {
        span.end();
      }
    });
  return {
    list: wrap(adapter.list, "list"),
    get: wrap(adapter.get, "get"),
    create: wrap(adapter.create, "create"),
    update: wrap(adapter.update, "update"),
    remove: wrap(adapter.remove, "remove"),
  } as CrudPort<T>;
}

export function withRetry<T>(adapter: CrudPort<T>): CrudPort<T> { return adapter; }
export function withCache<T>(adapter: CrudPort<T>): CrudPort<T> { return adapter; }
export function withCircuitBreaker<T>(adapter: CrudPort<T>): CrudPort<T> { return adapter; }
