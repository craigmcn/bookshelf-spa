import { api } from "./client";
import type { AdminUser, AdminReading, DashboardData } from "../types";

export const adminApi = {
  dashboard: () => api.get<DashboardData>("/admin"),
  users: () =>
    api.get<{ users: AdminUser[]; available_roles: string[] }>("/admin/users"),
  updateUser: (id: number, role_ids: number[]) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}`, {
      user: { role_ids },
    }),
  readings: () => api.get<{ readings: AdminReading[] }>("/admin/readings"),
};
