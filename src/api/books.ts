import { api } from "./client";
import type { Book, BookWithReading, BookSearchResult } from "../types";

type BookParams = { title: string; author: string; cover_url?: string | null };

export const booksApi = {
  list: () => api.get<{ books: Book[] }>("/books"),
  get: (id: number) => api.get<{ book: BookWithReading }>(`/books/${id}`),
  create: (data: BookParams) =>
    api.post<{ book: Book }>("/books", { book: data }),
  update: (id: number, data: Partial<BookParams>) =>
    api.patch<{ book: Book }>(`/books/${id}`, { book: data }),
  delete: (id: number) => api.delete<void>(`/books/${id}`),
  search: (q: string) =>
    api.get<{ results: BookSearchResult[] }>(
      `/book_search?q=${encodeURIComponent(q)}`,
    ),
};
