import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { Alert, PageHeader } from "../components/ui";

function Profile() {
  const { user, setUser } = useAuth();
  const [options, setOptions] = useState({ interests: [], departments: [], years: [] });
  const [form, setForm] = useState({
    department: user?.department || "",
    year: user?.year || "",
    interests: user?.interests || [],
  });
  const [borrows, setBorrows] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/profile/options").then(setOptions).catch(() => {});
    api("/api/profile")
      .then((data) => {
        setUser(data.user);
        setForm({
          department: data.user.department || "",
          year: data.user.year || "",
          interests: data.user.interests || [],
        });
        setBorrows(data.borrows);
        setRatings(data.ratings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setUser]);

  function toggleInterest(item) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(item)
        ? current.interests.filter((value) => value !== item)
        : [...current.interests, item],
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await api("/api/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setUser(data.user);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader eyebrow="Account" title="Profile">
        Department, year, and subjects are used when ranking suggested books.
      </PageHeader>

      <Alert tone="ok">{message}</Alert>
      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading profile...</p> : null}

      <form onSubmit={saveProfile} className="border border-line bg-surface p-5">
        <h2 className="text-base font-semibold">Student details</h2>
        <p className="mt-1 text-sm text-muted">
          {user?.name} · {user?.email}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-dept" className="text-sm font-medium">
              Department
            </label>
            <select
              id="profile-dept"
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
            <label htmlFor="profile-year" className="text-sm font-medium">
              Year
            </label>
            <select
              id="profile-year"
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

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Interests</legend>
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
                    selected ? "border-accent bg-accent text-white" : "border-line bg-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" disabled={saving} className="btn btn-primary mt-6">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="border-b border-line pb-2 text-base font-semibold">Borrowed books</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {borrows.map((item) => (
              <li key={item._id} className="flex justify-between gap-3">
                <Link to={`/books/${item.book?._id}`} className="hover:underline">
                  {item.book?.title || "Unknown book"}
                </Link>
                <span className="capitalize text-muted">{item.status}</span>
              </li>
            ))}
          </ul>
          {borrows.length === 0 ? <p className="mt-2 text-sm text-muted">No borrowed books yet.</p> : null}
        </section>

        <section>
          <h2 className="border-b border-line pb-2 text-base font-semibold">Rated books</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {ratings.map((item) => (
              <li key={item._id} className="flex justify-between gap-3">
                <Link to={`/books/${item.book?._id}`} className="hover:underline">
                  {item.book?.title || "Unknown book"}
                </Link>
                <span className="text-muted">{item.rating}/5</span>
              </li>
            ))}
          </ul>
          {ratings.length === 0 ? <p className="mt-2 text-sm text-muted">No ratings yet.</p> : null}
        </section>
      </div>
    </section>
  );
}

export default Profile;
