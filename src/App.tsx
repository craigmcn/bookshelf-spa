import { Route, Routes } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import ReadingsPage from "./pages/ReadingsPage";
import SignInPage from "./pages/SignInPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReadingsPage from "./pages/admin/AdminReadingsPage";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route
          path="/readings"
          element={
            <ProtectedRoute>
              <ReadingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireModerator>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="readings" element={<AdminReadingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
