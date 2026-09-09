import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminBooks from "./pages/AdminBooks";
import AdminBorrows from "./pages/AdminBorrows";
import AdminDashboard from "./pages/AdminDashboard";
import BookDetail from "./pages/BookDetail";
import Books from "./pages/Books";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Login from "./pages/Login";
import MyBooks from "./pages/MyBooks";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/books" element={<AdminBooks />} />
                <Route path="/admin/borrows" element={<AdminBorrows />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
