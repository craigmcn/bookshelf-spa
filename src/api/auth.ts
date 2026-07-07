import { api } from "./client";

export type CurrentUser = {
  id: number;
  email: string;
  roles: string[];
};

type SessionResponse = { user: CurrentUser };

export const authApi = {
  getSession: () => api.get<SessionResponse>("/session"),
  signIn: (email: string, password: string) =>
    api.post<SessionResponse>("/session", { session: { email, password } }),
  signOut: () => api.delete<void>("/session"),
};
