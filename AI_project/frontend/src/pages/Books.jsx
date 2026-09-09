import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import BookCover from "../components/BookCover";
import { Alert, PageHeader } from "../components/ui";

function Books() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [genre, setGenre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/books/genres")
      .then((data) => setGenres(data.genres))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (genre) params.set("genre", genre);

    const timer = setTimeout(() => {
      setLoading(true);
      api(`/api/books?${params.toString()}`)
        .then((data) => {
          setBooks(data.books);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [search, genre]);

  return (
    <section>
      <PageHeader eyebrow="Catalog" title="Find a book">
        Search by title or author, then narrow by subject.
      </PageHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="catalog-search" className="sr-only">
          Search books
        </label>
        <input
          id="catalog-search"
          placeholder="Title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field sm:max-w-md"
        />
        <label htmlFor="catalog-genre" className="sr-only">
          Filter by genre
        </label>
        <select
          id="catalog-genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="field sm:w-52"
        >
          <option value="">All subjects</option>
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <Alert tone="error">{error}</Alert>
      {loading ? <p className="text-sm text-muted">Loading catalog...</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {books.map((book) => (
          <Link key={book._id} to={`/books/${book._id}`} className="group block">
            <div className="aspect-[2/3] overflow-hidden border border-line">
              <BookCover book={book} />
            </div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{book.genre}</p>
            <h2 className="text-sm font-semibold leading-snug group-hover:underline">{book.title}</h2>
            <p className="text-xs text-muted">{book.author}</p>
            <p className="mt-1 text-xs text-muted">
              {book.availableCopies > 0
                ? `${book.availableCopies} of ${book.totalCopies} available`
                : "Not on shelf"}
              {book.rating ? ` · ${book.rating}/5` : ""}
            </p>
          </Link>
        ))}
      </div>

      {books.length === 0 && !error && !loading ? (
        <p className="mt-8 text-sm text-muted">No books match that search.</p>
      ) : null}
    </section>
  );
}

export default Books;
