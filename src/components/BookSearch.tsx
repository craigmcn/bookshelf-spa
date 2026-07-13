import { useState, useEffect, useRef } from "react";
import { booksApi } from "../api/books";
import type { BookSearchResult } from "../types";

type Props = {
  onSelect: (result: BookSearchResult) => void;
};

export default function BookSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { results: found } = await booksApi.search(query);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: BookSearchResult) {
    onSelect(result);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="mb-3">
      <label htmlFor="book-search" className="form-label">
        Search Open Library
      </label>
      <div className="position-relative">
        <input
          id="book-search"
          type="search"
          className="form-control"
          placeholder="Title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {loading && (
          <span
            className="spinner-border spinner-border-sm position-absolute top-50 end-0 translate-middle-y me-2 text-secondary"
            aria-hidden="true"
          />
        )}
      </div>
      {results.length > 0 && (
        <ul className="list-group mt-1" role="listbox">
          {results.map((r, i) => (
            <li key={i} className="list-group-item list-group-item-action">
              <button
                type="button"
                className="btn btn-link text-start p-0 w-100"
                onClick={() => handleSelect(r)}
              >
                <strong>{r.title}</strong>{" "}
                <span className="text-muted">by {r.author}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
