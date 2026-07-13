import { api } from "./client";
import type { Reading } from "../types";

type ReadingParams = {
  book_id?: number;
  status: string;
  rating?: number | null;
  review?: string | null;
};

export const readingsApi = {
  list: () => api.get<{ readings: Reading[] }>("/readings"),
  get: (id: number) => api.get<{ reading: Reading }>(`/readings/${id}`),
  create: (data: ReadingParams) =>
    api.post<{ reading: Reading }>("/readings", { reading: data }),
  update: (id: number, data: Partial<ReadingParams>) =>
    api.patch<{ reading: Reading }>(`/readings/${id}`, { reading: data }),
  delete: (id: number) => api.delete<void>(`/readings/${id}`),
};
