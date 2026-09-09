import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Alert, PageHeader } from "../components/ui";

function History() {
  const [borrows, setBorrows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/borrows/history")
      .then((data) => setBorrows(data.borrows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageHeader eyebrow="Loans" title="Borrowing history">
        Every title you have borrowed, including items already returned.
      </PageHeader>

      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading history...</p> : null}

      {!loading && borrows.length > 0 ? (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrowed</th>
                <th>Returned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((item) => (
                <tr key={item._id}>
                  <td>
                    <Link to={`/books/${item.book?._id}`} className="font-medium hover:underline">
                      {item.book?.title || "Unknown book"}
                    </Link>
                    <p className="text-muted">{item.book?.author}</p>
                  </td>
                  <td>{new Date(item.borrowedAt).toLocaleDateString()}</td>
                  <td>{item.returnedAt ? new Date(item.returnedAt).toLocaleDateString() : "—"}</td>
                  <td className="capitalize">{item.status === "borrowed" ? "On loan" : item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && borrows.length === 0 && !error ? (
        <p className="text-sm text-muted">No borrowing history yet.</p>
      ) : null}
    </section>
  );
}

export default History;
