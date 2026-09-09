import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { Alert } from "../components/ui";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-line bg-surface px-12 py-10 lg:flex">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">College</p>
        <div>
          <h1 className="max-w-sm text-4xl font-semibold leading-tight">Campus Library</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Search the catalog, check out books, and get reading suggestions based on your courses and loans.
          </p>
        </div>
        <p className="text-sm text-muted">Student and staff access</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:hidden">
            Campus Library
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Use your library account.</p>

          <Alert tone="error">{error}</Alert>

          <label htmlFor="email" className="mt-6 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="field"
          />

          <label htmlFor="password" className="mt-4 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="field"
          />

          <button type="submit" disabled={saving} className="btn btn-primary mt-6 w-full">
            {saving ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            New student?{" "}
            <Link to="/register" className="font-medium text-accent underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
