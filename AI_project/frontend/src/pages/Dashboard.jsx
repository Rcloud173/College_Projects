import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import BookCover from "../components/BookCover";
import RecommendationCard from "../components/RecommendationCard";
import { Alert, PageHeader, SectionTitle } from "../components/ui";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [borrowed, setBorrowed] = useState([]);
  const [recs, setRecs] = useState(null);
  const [popular, setPopular] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/api/borrows/active"),
      api("/api/recommendations"),
      api("/api/books"),
    ])
      .then(([active, recommendations, booksData]) => {
        setBorrowed(active.borrows);
        setRecs(recommendations);
        const sorted = [...booksData.books].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title)
        );
        setPopular(sorted.slice(0, 4));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const interests = recs?.student?.interests || user?.interests || [];

  function searchCatalog(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/books?search=${encodeURIComponent(q)}` : "/books");
  }

  return (
    <div>
      <PageHeader eyebrow="Campus Library" title={`Hello, ${user?.name?.split(" ")[0] || "reader"}`}>
        Find a book, continue a loan, or see titles suggested from your interests and reading history.
      </PageHeader>

      <form onSubmit={searchCatalog} className="mb-10 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="home-search" className="sr-only">
          Search the catalog
        </label>
        <input
          id="home-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author"
          className="field sm:flex-1"
        />
        <button type="submit" className="btn btn-primary sm:mt-1">
          Search catalog
        </button>
      </form>

      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading library...</p> : null}

      {!loading && (
        <div className="space-y-10">
          <section>
            <SectionTitle
              title="Currently borrowed"
              action={
                <Link to="/my-books" className="text-sm font-medium text-accent hover:underline">
                  All loans
                </Link>
              }
            />
            {borrowed.length === 0 ? (
              <p className="text-sm text-muted">You have nothing checked out.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {borrowed.slice(0, 4).map((item) => (
                  <li key={item._id} className="flex items-center gap-4 py-3">
                    <div className="h-16 w-11 shrink-0 overflow-hidden border border-line">
                      <BookCover book={item.book} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/books/${item.book?._id}`} className="font-medium hover:underline">
                        {item.book?.title}
                      </Link>
                      <p className="text-sm text-muted">{item.book?.author}</p>
                    </div>
                    <p className="hidden text-xs text-muted sm:block">
                      {new Date(item.borrowedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle
              title="Suggested for you"
              action={
                <Link to="/recommendations" className="text-sm font-medium text-accent hover:underline">
                  Full list
                </Link>
              }
            />
            {recs?.recommendations?.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {recs.recommendations.slice(0, 4).map((item) => (
                  <RecommendationCard key={item.book._id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                No suggestions yet. Add interests or leave some titles in the catalog unborrowed.
              </p>
            )}
          </section>

          <section>
            <SectionTitle
              title="Popular in the collection"
              action={
                <Link to="/books" className="text-sm font-medium text-accent hover:underline">
                  Browse catalog
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {popular.map((book) => (
                <Link key={book._id} to={`/books/${book._id}`} className="group block">
                  <div className="aspect-[2/3] overflow-hidden border border-line">
                    <BookCover book={book} />
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">{book.genre}</p>
                  <p className="text-sm font-semibold leading-snug group-hover:underline">{book.title}</p>
                  <p className="text-xs text-muted">{book.author}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle
              title="Your subjects"
              action={
                <Link to="/profile" className="text-sm font-medium text-accent hover:underline">
                  Edit
                </Link>
              }
            />
            {interests.length ? (
              <p className="text-sm text-ink">{interests.join(" · ")}</p>
            ) : (
              <p className="text-sm text-muted">
                No subjects saved.{" "}
                <Link to="/profile" className="text-accent hover:underline">
                  Add them on your profile
                </Link>
                .
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
