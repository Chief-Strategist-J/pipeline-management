import { z } from "zod";
import { httpClient } from "../http/http-client";

export interface EntitySchema<T> {
  name: string;
  endpoint: string;
  schema: z.ZodSchema<T>;
}

export interface CrudPort<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export function createEntityAdapter<T>(config: EntitySchema<T>): CrudPort<T> {
  return {
    async list(): Promise<T[]> {
      const data = await httpClient.get<unknown>(config.endpoint);
      return z.array(config.schema).parse(data);
    },
    async get(id: string): Promise<T> {
      const data = await httpClient.get<unknown>(`${config.endpoint}/${id}`);
      return config.schema.parse(data);
    },
    async create(payload: Partial<T>): Promise<T> {
      const data = await httpClient.post<unknown>(config.endpoint, payload);
      return config.schema.parse(data);
    },
    async update(id: string, payload: Partial<T>): Promise<T> {
      const data = await httpClient.put<unknown>(`${config.endpoint}/${id}`, payload);
      return config.schema.parse(data);
    },
    async remove(id: string): Promise<boolean> {
      const res = await httpClient.delete<{ success: boolean }>(`${config.endpoint}?id=${id}`);
      return res.success ?? true;
    },
  };
}
