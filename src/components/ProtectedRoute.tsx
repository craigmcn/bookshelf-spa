import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  requireModerator?: boolean;
};

export default function ProtectedRoute({
  children,
  requireModerator = false,
}: Props) {
  const { authState } = useAuth();

  if (authState.status === "loading") {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (authState.status === "signed_out") {
    return <Navigate to="/sign-in" replace />;
  }

  if (requireModerator) {
    const { roles } = authState.user;
    if (!roles.includes("moderator") && !roles.includes("admin")) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
