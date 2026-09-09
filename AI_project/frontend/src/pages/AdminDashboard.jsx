import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import BarList from "../components/BarList";
import { Alert, PageHeader, SectionTitle } from "../components/ui";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!stats) return <p className="text-sm text-muted">Loading desk overview...</p>;

  const cards = [
    ["Books", stats.totals.totalBooks],
    ["Students", stats.totals.totalStudents],
    ["On loan", stats.totals.currentlyBorrowed],
    ["Overdue", stats.totals.overdueBooks],
  ];

  return (
    <section>
      <PageHeader eyebrow="Staff desk" title="Library overview">
        Live counts from the catalog. A loan is overdue after {stats.loanDays} days.
      </PageHeader>

      <dl className="grid grid-cols-2 border border-line bg-surface lg:grid-cols-4">
        {cards.map(([label, value], index) => (
          <div
            key={label}
            className={`px-4 py-4 ${index !== 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""} ${
              index === 2 ? "lg:border-t-0" : ""
            }`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/admin/books" className="btn btn-primary">
          Manage books
        </Link>
        <Link to="/admin/borrows" className="btn btn-secondary">
          Loan records
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionTitle title="Most borrowed titles" />
          <BarList items={stats.mostBorrowed} labelKey="title" valueKey="borrowCount" />
        </section>
        <section>
          <SectionTitle title="Popular subjects" />
          <BarList items={stats.popularGenres} labelKey="genre" valueKey="count" />
        </section>
      </div>
    </section>
  );
}

export default AdminDashboard;
