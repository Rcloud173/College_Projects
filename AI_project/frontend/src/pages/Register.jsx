import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { Alert } from "../components/ui";

function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [options, setOptions] = useState({ interests: [], departments: [], years: [] });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    interests: [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/profile/options").then(setOptions).catch(() => {});
  }, []);

  if (user) return <Navigate to="/" replace />;

  function toggleInterest(item) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(item)
        ? current.interests.filter((value) => value !== item)
        : [...current.interests, item],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Campus Library</p>
      <h1 className="mt-2 text-2xl font-semibold">Create a student account</h1>
      <p className="mt-1 text-sm text-muted">Interests help the catalog suggest books in your subjects.</p>

      <form onSubmit={handleSubmit} className="mt-8 border border-line bg-surface p-6">
        <Alert tone="error">{error}</Alert>

        <label htmlFor="name" className="mt-2 block text-sm font-medium">
          Full name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="field"
        />

        <label htmlFor="reg-email" className="mt-4 block text-sm font-medium">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="field"
        />

        <label htmlFor="reg-password" className="mt-4 block text-sm font-medium">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="field"
        />
        <p className="mt-1 text-xs text-muted">At least 6 characters.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="block text-sm font-medium">
              Department
            </label>
            <select
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="field"
            >
              <option value="">Select department</option>
              {options.departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium">
              Year
            </label>
            <select
              id="year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="field"
            >
              <option value="">Select year</option>
              {options.years.map((item) => (
                <option key={item} value={item}>
                  Year {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Reading interests</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.interests.map((item) => {
              const selected = form.interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  aria-pressed={selected}
                  className={`border px-3 py-1.5 text-sm ${
                    selected ? "border-accent bg-accent text-white" : "border-line bg-white text-ink"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" disabled={saving} className="btn btn-primary mt-6 w-full">
          {saving ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
