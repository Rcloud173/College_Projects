import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import BookCover from "../components/BookCover";
import { Alert } from "../components/ui";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);

  async function load() {
    const data = await api(`/api/books/${id}`);
    setBook(data.book);
    const mine = await api(`/api/ratings/book/${id}`);
    setMyRating(mine.rating);
  }

  useEffect(() => {
    setError("");
    setBook(null);
    setMessage("");
    load().catch((err) => setError(err.message));
  }, [id]);

  async function borrowBook() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await api("/api/borrows", {
        method: "POST",
        body: JSON.stringify({ bookId: id }),
      });
      setBook(data.book);
      setMessage("Book borrowed. See My Books to return it.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function rateBook(value) {
    setRatingSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await api("/api/ratings", {
        method: "POST",
        body: JSON.stringify({ bookId: id, rating: value }),
      });
      setBook(data.book);
      setMyRating(value);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setRatingSaving(false);
    }
  }

  if (error && !book) {
    return <Alert tone="error">{error}</Alert>;
  }

  if (!book) {
    return <p className="text-sm text-muted">Loading title...</p>;
  }

  const available = book.availableCopies > 0;

  return (
    <article>
      <Link to="/books" className="text-sm font-medium text-accent hover:underline">
        Back to catalog
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="mx-auto w-48 overflow-hidden border border-line lg:w-full">
          <div className="aspect-[2/3]">
            <BookCover book={book} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{book.genre}</p>
          <h1 className="mt-1 text-3xl font-semibold leading-tight">{book.title}</h1>
          <p className="mt-1 text-lg text-muted">{book.author}</p>

          <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Collection rating</dt>
              <dd>{book.rating ? `${book.rating} / 5` : "No ratings yet"}</dd>
            </div>
            <div>
              <dt className="text-muted">Availability</dt>
              <dd>
                {available
                  ? `${book.availableCopies} of ${book.totalCopies} copies on shelf`
                  : `None of ${book.totalCopies} copies on shelf`}
              </dd>
            </div>
          </dl>

          {book.description ? <p className="mt-5 max-w-2xl text-sm leading-7">{book.description}</p> : null}

          <div className="mt-6">
            <p className="text-sm font-medium">Your rating</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={ratingSaving}
                  onClick={() => rateBook(value)}
                  aria-label={`Rate ${value} out of 5`}
                  aria-pressed={myRating === value}
                  className={`h-9 w-9 border text-sm font-semibold ${
                    myRating === value ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              One rating is stored per book. Choosing again updates that rating.
            </p>
          </div>

          <Alert tone="ok">{message}</Alert>
          <Alert tone="error">{error}</Alert>

          <button
            type="button"
            onClick={borrowBook}
            disabled={!available || saving}
            className="btn btn-primary mt-6"
          >
            {!available ? "Not available" : saving ? "Borrowing..." : "Borrow this book"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default BookDetail;
