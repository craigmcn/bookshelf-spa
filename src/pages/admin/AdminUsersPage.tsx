import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { AdminUser } from "../../types";

type UsersData = {
  users: AdminUser[];
  available_roles: string[];
};

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<number, string[]>>(
    {},
  );

  useEffect(() => {
    adminApi
      .users()
      .then((res) => {
        setData(res);
        const initial: Record<number, string[]> = {};
        res.users.forEach((u) => {
          initial[u.id] = [...u.roles];
        });
        setPendingRoles(initial);
      })
      .catch(() => setError("Failed to load users."));
  }, []);

  async function handleSave(user: AdminUser) {
    if (!data) return;
    setSaving(user.id);
    try {
      const roleNames = pendingRoles[user.id] ?? [];
      const roleIds = roleNames
        .map((name) => data.available_roles.indexOf(name) + 1)
        .filter((id) => id > 0);
      const { user: updated } = await adminApi.updateUser(user.id, roleIds);
      setData((d) =>
        d
          ? {
              ...d,
              users: d.users.map((u) => (u.id === updated.id ? updated : u)),
            }
          : d,
      );
      setPendingRoles((prev) => ({
        ...prev,
        [updated.id]: [...updated.roles],
      }));
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  function toggleRole(userId: number, role: string) {
    setPendingRoles((prev) => {
      const current = prev[userId] ?? [];
      return {
        ...prev,
        [userId]: current.includes(role)
          ? current.filter((r) => r !== role)
          : [...current, role],
      };
    });
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Email</th>
            <th>Roles</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  {data.available_roles.map((role) => (
                    <div key={role} className="form-check mb-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`role-${user.id}-${role}`}
                        checked={(pendingRoles[user.id] ?? []).includes(role)}
                        onChange={() => toggleRole(user.id, role)}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor={`role-${user.id}-${role}`}
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={saving === user.id}
                  onClick={() => handleSave(user)}
                >
                  {saving === user.id ? "Saving…" : "Save"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
