import { NavLink, Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="container">
      <h1 className="h2 mb-3">Admin</h1>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin" end>
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/users">
            Users
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/readings">
            Reviews
          </NavLink>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
