import { useEffect, useState } from "react";
import { Link } from "react-router";
import { adminApi } from "../../api/admin";
import type { DashboardData } from "../../types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard."));
  }, []);

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
      <div className="row g-3 mb-4">
        {[
          { label: "Users", value: data.total_users },
          { label: "Books", value: data.total_books },
          { label: "Readings", value: data.total_readings },
        ].map(({ label, value }) => (
          <div key={label} className="col-sm-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="display-6">{value}</div>
                <div className="text-muted">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h5">Most-read Books</h2>
      <ol className="list-group list-group-numbered">
        {data.popular_books.map((book) => (
          <li
            key={book.id}
            className="list-group-item d-flex justify-content-between align-items-start"
          >
            <div className="ms-2 me-auto">
              <Link
                to={`/books/${book.id}`}
                className="fw-semibold text-decoration-none"
              >
                {book.title}
              </Link>
              <div className="text-muted small">{book.author}</div>
            </div>
            <span className="badge bg-primary rounded-pill">
              {book.readings_count}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
