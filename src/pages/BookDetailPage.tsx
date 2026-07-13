import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { booksApi } from "../api/books";
import { readingsApi } from "../api/readings";
import { useAuth } from "../context/AuthContext";
import BookCover from "../components/BookCover";
import { RatingDisplay, RatingSelect } from "../components/RatingStars";
import type { BookWithReading, UserReading } from "../types";

const STATUS_LABELS: Record<string, string> = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const isSignedIn = authState.status === "signed_in";

  const [book, setBook] = useState<BookWithReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("want_to_read");
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    booksApi
      .get(Number(id))
      .then(({ book: fetched }) => {
        setBook(fetched);
        if (fetched.user_reading) {
          setStatus(fetched.user_reading.status);
          setRating(fetched.user_reading.rating);
          setReview(fetched.user_reading.review ?? "");
        }
      })
      .catch(() => setError("Book not found."))
      .finally(() => setLoading(false));
  }, [id]);

  function startEdit(reading: UserReading | null | undefined) {
    if (reading) {
      setStatus(reading.status);
      setRating(reading.rating);
      setReview(reading.review ?? "");
    } else {
      setStatus("want_to_read");
      setRating(null);
      setReview("");
    }
    setSaveError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!book) return;
    setSaving(true);
    setSaveError(null);
    try {
      const existing = book.user_reading;
      const payload = {
        status,
        rating: rating ?? null,
        review: review || null,
      };
      if (existing) {
        const { reading } = await readingsApi.update(existing.id, payload);
        setBook((b) =>
          b
            ? {
                ...b,
                user_reading: {
                  id: reading.id,
                  status: reading.status,
                  rating: reading.rating,
                  review: reading.review,
                },
              }
            : b,
        );
      } else {
        const { reading } = await readingsApi.create({
          book_id: book.id,
          ...payload,
        });
        setBook((b) =>
          b
            ? {
                ...b,
                user_reading: {
                  id: reading.id,
                  status: reading.status,
                  rating: reading.rating,
                  review: reading.review,
                },
              }
            : b,
        );
      }
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!book?.user_reading) return;
    if (!confirm("Remove this reading from your list?")) return;
    try {
      await readingsApi.delete(book.user_reading.id);
      setBook((b) => (b ? { ...b, user_reading: null } : b));
      setEditing(false);
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

  if (error || !book) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error ?? "Book not found."}
        </div>
      </div>
    );
  }

  const userReading = book.user_reading;

  return (
    <main className="container">
      <div className="row mb-4">
        <div className="col-auto">
          <BookCover
            coverUrl={book.cover_url}
            title={book.title}
            height={180}
          />
        </div>
        <div className="col">
          <h1 className="h2">{book.title}</h1>
          <p className="text-muted fs-5">{book.author}</p>
        </div>
      </div>

      {isSignedIn && (
        <section aria-labelledby="reading-status-heading">
          <h2 className="h5" id="reading-status-heading">
            My Reading
          </h2>
          {!editing ? (
            <>
              {userReading ? (
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className="badge bg-primary">
                    {STATUS_LABELS[userReading.status] ?? userReading.status}
                  </span>
                  <RatingDisplay rating={userReading.rating} />
                </div>
              ) : (
                <p className="text-muted mb-2">Not on your list yet.</p>
              )}
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => startEdit(userReading)}
              >
                {userReading ? "Edit" : "Add to my list"}
              </button>
            </>
          ) : (
            <form
              onSubmit={handleSave}
              className="card p-3"
              style={{ maxWidth: 480 }}
            >
              {saveError && (
                <div className="alert alert-danger" role="alert">
                  {saveError}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="reading-status" className="form-label">
                  Status
                </label>
                <select
                  id="reading-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="reading-rating" className="form-label">
                  Rating
                </label>
                <RatingSelect
                  id="reading-rating"
                  value={rating}
                  onChange={setRating}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="reading-review" className="form-label">
                  Review
                </label>
                <textarea
                  id="reading-review"
                  className="form-control"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2 flex-wrap">
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
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                {userReading && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-auto"
                    onClick={handleDelete}
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
