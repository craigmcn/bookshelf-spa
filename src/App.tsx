import { Route, Routes } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import ReadingsPage from "./pages/ReadingsPage";
import SignInPage from "./pages/SignInPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
      </Routes>
    </AuthProvider>
  );
}
