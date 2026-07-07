import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();

  const isModerator =
    authState.status === "signed_in" &&
    (authState.user.roles.includes("moderator") ||
      authState.user.roles.includes("admin"));

  async function handleSignOut() {
    await signOut();
    navigate("/sign-in");
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Community Bookshelf
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Books
              </NavLink>
            </li>
            {authState.status === "signed_in" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/readings">
                  My Readings
                </NavLink>
              </li>
            )}
            {isModerator && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {authState.status === "signed_in" ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light opacity-75">
                    {authState.user.email}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : authState.status === "signed_out" ? (
              <li className="nav-item">
                <NavLink className="nav-link" to="/sign-in">
                  Sign in
                </NavLink>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
}
