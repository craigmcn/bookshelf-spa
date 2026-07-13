import { useEffect, useState } from "react";
import { Link } from "react-router";
import { booksApi } from "../api/books";
import { useAuth } from "../context/AuthContext";
import BookCover from "../components/BookCover";
import BookSearch from "../components/BookSearch";
import type { Book, BookSearchResult } from "../types";

export default function BooksPage() {
  const { authState } = useAuth();
  const isSignedIn = authState.status === "signed_in";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    cover_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    booksApi
      .list()
      .then(({ books: fetched }) => setBooks(fetched))
      .catch(() => setError("Failed to load books."))
      .finally(() => setLoading(false));
  }, []);

  function handleSearchSelect(result: BookSearchResult) {
    setFormData({
      title: result.title,
      author: result.author,
      cover_url: result.cover_url ?? "",
    });
    setShowAddForm(true);
  }

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const { book } = await booksApi.create({
        title: formData.title,
        author: formData.author,
        cover_url: formData.cover_url || null,
      });
      setBooks((prev) => [book, ...prev]);
      setFormData({ title: "", author: "", cover_url: "" });
      setShowAddForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save book.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h2 mb-0">Books</h1>
        {isSignedIn && !showAddForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            + Add Book
          </button>
        )}
      </div>

      {isSignedIn && showAddForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="card-title h5">Add a Book</h2>
            <BookSearch onSelect={handleSearchSelect} />
            <form onSubmit={handleAddBook}>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="add-title" className="form-label">
                  Title
                </label>
                <input
                  id="add-title"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="add-author" className="form-label">
                  Author
                </label>
                <input
                  id="add-author"
                  className="form-control"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, author: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="add-cover" className="form-label">
                  Cover URL
                </label>
                <input
                  id="add-cover"
                  className="form-control"
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, cover_url: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save book"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError(null);
                    setFormData({ title: "", author: "", cover_url: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <p className="text-muted">No books yet.</p>
      )}

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
        {books.map((book) => (
          <div key={book.id} className="col">
            <Link
              to={`/books/${book.id}`}
              className="card h-100 text-decoration-none text-dark"
            >
              <div className="card-img-top d-flex justify-content-center pt-3">
                <BookCover coverUrl={book.cover_url} title={book.title} />
              </div>
              <div className="card-body p-2">
                <p className="card-title mb-0 small fw-semibold">
                  {book.title}
                </p>
                <p className="card-text text-muted small">{book.author}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
