import { useEffect, useState } from "react";
import { Link } from "react-router";
import { adminApi } from "../../api/admin";
import { RatingDisplay } from "../../components/RatingStars";
import type { AdminReading } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
};

export default function AdminReadingsPage() {
  const [readings, setReadings] = useState<AdminReading[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .readings()
      .then(({ readings: fetched }) => setReadings(fetched))
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (readings.length === 0) {
    return <p className="text-muted">No reviews yet.</p>;
  }

  return (
    <div className="d-flex flex-column gap-3">
      {readings.map((r) => (
        <div key={r.id} className={`card ${r.deleted_at ? "opacity-50" : ""}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div>
                <Link
                  to={`/books/${r.book.id}`}
                  className="fw-semibold text-decoration-none"
                >
                  {r.book.title}
                </Link>{" "}
                <span className="text-muted small">by {r.book.author}</span>
              </div>
              <div className="text-end">
                <span className="badge bg-secondary me-1">
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <RatingDisplay rating={r.rating} />
              </div>
            </div>
            <p className="mb-1">{r.review}</p>
            <div className="text-muted small">
              {r.user.email} · {new Date(r.updated_at).toLocaleDateString()}
              {r.deleted_at && " · deleted"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
