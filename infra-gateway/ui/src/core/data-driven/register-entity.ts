import { createEntitySlice } from "./create-entity-slice";
import { createEntityAdapter, type CrudPort, type EntitySchema } from "./create-entity-adapter";
import { createEntitySaga } from "./create-entity-sagas";
import { withTracing, withCircuitBreaker, withCache, withRetry } from "./adapter-decorators";

export function registerEntity<T>(schema: EntitySchema<T>, customAdapter?: CrudPort<T>) {
  const adapter = customAdapter ?? withTracing(
    withCircuitBreaker(withCache(withRetry(createEntityAdapter(schema)))),
    schema.name
  );
  const slice = createEntitySlice<T>(schema.name);
  const saga = createEntitySaga(slice, adapter);
  return { schema, adapter, slice, saga };
}
