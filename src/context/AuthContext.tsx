import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi, type CurrentUser } from "../api/auth";

type AuthState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "signed_in"; user: CurrentUser };

type AuthContextValue = {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    authApi
      .getSession()
      .then(({ user }) => setAuthState({ status: "signed_in", user }))
      .catch(() => setAuthState({ status: "signed_out" }));
  }, []);

  async function signIn(email: string, password: string) {
    const { user } = await authApi.signIn(email, password);
    setAuthState({ status: "signed_in", user });
  }

  async function signOut() {
    await authApi.signOut();
    setAuthState({ status: "signed_out" });
  }

  return (
    <AuthContext value={{ authState, signIn, signOut }}>{children}</AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
