import { useEffect, useState } from "react";
import { api } from "../api";
import { Alert, PageHeader } from "../components/ui";

function AdminBorrows() {
  const [rows, setRows] = useState([]);
  const [loanDays, setLoanDays] = useState(14);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/admin/borrows")
      .then((data) => {
        setRows(data.borrows);
        setLoanDays(data.loanDays);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageHeader eyebrow="Staff desk" title="Loan records">
        All student loans. Overdue means still out after {loanDays} days.
      </PageHeader>

      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading records...</p> : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Borrowed</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item._id} className={item.overdue ? "bg-warn-bg" : ""}>
                  <td>
                    <p>{item.user?.name || "Unknown"}</p>
                    <p className="text-muted">{item.user?.email}</p>
                  </td>
                  <td>
                    <p>{item.book?.title || "Unknown"}</p>
                    <p className="text-muted">{item.book?.genre}</p>
                  </td>
                  <td>{new Date(item.borrowedAt).toLocaleDateString()}</td>
                  <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td>
                    {item.overdue ? (
                      <span className="font-semibold text-warn">Overdue</span>
                    ) : (
                      <span className="capitalize">{item.status === "borrowed" ? "On loan" : item.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && rows.length === 0 && !error ? (
        <p className="text-sm text-muted">No borrow records yet.</p>
      ) : null}
    </section>
  );
}

export default AdminBorrows;
