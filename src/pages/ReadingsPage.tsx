import { useEffect, useState } from "react";
import { Link } from "react-router";
import { readingsApi } from "../api/readings";
import BookCover from "../components/BookCover";
import { RatingDisplay, RatingSelect } from "../components/RatingStars";
import type { Reading } from "../types";

const STATUS_LABELS: Record<string, string> = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
};

const STATUS_BADGE: Record<string, string> = {
  want_to_read: "secondary",
  reading: "primary",
  finished: "success",
};

type EditState = {
  id: number;
  status: string;
  rating: number | null;
  review: string;
};

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    readingsApi
      .list()
      .then(({ readings: fetched }) => setReadings(fetched))
      .catch(() => setError("Failed to load readings."))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(reading: Reading) {
    setEditing({
      id: reading.id,
      status: reading.status,
      rating: reading.rating,
      review: reading.review ?? "",
    });
    setSaveError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { reading } = await readingsApi.update(editing.id, {
        status: editing.status,
        rating: editing.rating,
        review: editing.review || null,
      });
      setReadings((prev) =>
        prev.map((r) => (r.id === reading.id ? reading : r)),
      );
      setEditing(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this reading?")) return;
    try {
      await readingsApi.delete(id);
      setReadings((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to remove reading.");
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="container">
      <h1 className="h2 mb-3">My Readings</h1>

      {readings.length === 0 && (
        <p className="text-muted">
          No readings yet. <Link to="/">Browse books</Link> to add some.
        </p>
      )}

      <div className="d-flex flex-column gap-3">
        {readings.map((reading) => {
          const isEditing = editing?.id === reading.id;
          const badgeColor = STATUS_BADGE[reading.status] ?? "secondary";

          return (
            <div key={reading.id} className="card">
              <div className="card-body">
                <div className="d-flex gap-3">
                  <Link to={`/books/${reading.book.id}`}>
                    <BookCover
                      coverUrl={reading.book.cover_url}
                      title={reading.book.title}
                      height={80}
                    />
                  </Link>
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <Link
                          to={`/books/${reading.book.id}`}
                          className="fw-semibold text-decoration-none text-dark"
                        >
                          {reading.book.title}
                        </Link>
                        <p className="text-muted small mb-1">
                          {reading.book.author}
                        </p>
                      </div>
                      <span className={`badge bg-${badgeColor} text-nowrap`}>
                        {STATUS_LABELS[reading.status] ?? reading.status}
                      </span>
                    </div>

                    {!isEditing && (
                      <>
                        <div className="mb-1">
                          <RatingDisplay rating={reading.rating} />
                        </div>
                        {reading.review && (
                          <p className="small text-muted mb-1">
                            {reading.review}
                          </p>
                        )}
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => startEdit(reading)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(reading.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}

                    {isEditing && (
                      <form onSubmit={handleSave} className="mt-2">
                        {saveError && (
                          <div
                            className="alert alert-danger py-1 small"
                            role="alert"
                          >
                            {saveError}
                          </div>
                        )}
                        <div className="row g-2 mb-2">
                          <div className="col-sm-4">
                            <label
                              htmlFor={`status-${reading.id}`}
                              className="form-label small"
                            >
                              Status
                            </label>
                            <select
                              id={`status-${reading.id}`}
                              className="form-select form-select-sm"
                              value={editing.status}
                              onChange={(e) =>
                                setEditing((s) =>
                                  s ? { ...s, status: e.target.value } : s,
                                )
                              }
                            >
                              {Object.entries(STATUS_LABELS).map(
                                ([val, label]) => (
                                  <option key={val} value={val}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div className="col-sm-4">
                            <label
                              htmlFor={`rating-${reading.id}`}
                              className="form-label small"
                            >
                              Rating
                            </label>
                            <RatingSelect
                              id={`rating-${reading.id}`}
                              value={editing.rating}
                              onChange={(v) =>
                                setEditing((s) => (s ? { ...s, rating: v } : s))
                              }
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor={`review-${reading.id}`}
                            className="form-label small"
                          >
                            Review
                          </label>
                          <textarea
                            id={`review-${reading.id}`}
                            className="form-control form-control-sm"
                            rows={2}
                            value={editing.review}
                            onChange={(e) =>
                              setEditing((s) =>
                                s ? { ...s, review: e.target.value } : s,
                              )
                            }
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={saving}
                          >
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
