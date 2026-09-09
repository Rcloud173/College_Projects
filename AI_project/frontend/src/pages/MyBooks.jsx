import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import BookCover from "../components/BookCover";
import { Alert, PageHeader } from "../components/ui";

function MyBooks() {
  const [borrows, setBorrows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api("/api/borrows/active");
    setBorrows(data.borrows);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function returnBook(id) {
    setError("");
    setMessage("");
    try {
      await api(`/api/borrows/${id}/return`, { method: "POST" });
      setMessage("Book returned.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader eyebrow="Loans" title="My books">
        Titles you currently have checked out. Return them here when you are done.
      </PageHeader>

      <Alert tone="ok">{message}</Alert>
      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading loans...</p> : null}

      <ul className="divide-y divide-line border-y border-line">
        {borrows.map((item) => (
          <li key={item._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <div className="h-20 w-14 shrink-0 overflow-hidden border border-line">
              <BookCover book={item.book} />
            </div>
            <div className="min-w-0 flex-1">
              <Link to={`/books/${item.book?._id}`} className="font-semibold hover:underline">
                {item.book?.title || "Unknown book"}
              </Link>
              <p className="text-sm text-muted">{item.book?.author}</p>
              <p className="mt-1 text-xs text-muted">
                Borrowed {new Date(item.borrowedAt).toLocaleDateString()} · Status: on loan
              </p>
            </div>
            <button type="button" onClick={() => returnBook(item._id)} className="btn btn-primary sm:self-center">
              Return
            </button>
          </li>
        ))}
      </ul>

      {borrows.length === 0 && !error && !loading ? (
        <p className="mt-6 text-sm text-muted">You have no active borrowed books.</p>
      ) : null}
    </section>
  );
}

export default MyBooks;
