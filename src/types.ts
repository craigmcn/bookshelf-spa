export type Book = {
  id: number;
  title: string;
  author: string;
  cover_url: string | null;
  added_by_id: number;
};

export type UserReading = {
  id: number;
  status: string;
  rating: number | null;
  review: string | null;
};

export type BookWithReading = Book & { user_reading?: UserReading | null };

export type Reading = {
  id: number;
  status: string;
  rating: number | null;
  review: string | null;
  deleted_at: string | null;
  book: {
    id: number;
    title: string;
    author: string;
    cover_url: string | null;
  };
};

export type AdminUser = {
  id: number;
  email: string;
  roles: string[];
};

export type AdminReading = {
  id: number;
  review: string;
  status: string;
  rating: number | null;
  deleted_at: string | null;
  updated_at: string;
  user: { id: number; email: string };
  book: { id: number; title: string; author: string };
};

export type DashboardData = {
  total_users: number;
  total_books: number;
  total_readings: number;
  popular_books: Array<{
    id: number;
    title: string;
    author: string;
    readings_count: number;
  }>;
};

export type BookSearchResult = {
  title: string;
  author: string;
  cover_url: string | null;
};
