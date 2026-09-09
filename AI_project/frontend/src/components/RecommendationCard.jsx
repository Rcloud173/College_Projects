import { Link } from "react-router-dom";
import BookCover from "./BookCover";

function RecommendationCard({ item }) {
  const book = item.book;
  const match = Math.round((item.score || 0) * 100);

  return (
    <article className="flex gap-4 border border-line bg-surface p-3">
      <div className="h-[148px] w-[96px] shrink-0 overflow-hidden border border-line">
        <BookCover book={book} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{book.genre}</p>
          <p className="text-xs font-semibold text-ink">{match}% match</p>
        </div>
        <h3 className="mt-1 text-base font-semibold leading-snug">{book.title}</h3>
        <p className="text-sm text-muted">{book.author}</p>
        <p className="mt-1 text-sm text-muted">
          {book.rating ? `Rated ${book.rating} / 5` : "Not rated yet"}
        </p>
        <p className="mt-2 text-sm leading-5 text-ink">{item.shortReason || item.reasons?.[0]}</p>
        <Link to={`/books/${book._id}`} className="btn btn-secondary mt-3">
          View book
        </Link>
      </div>
    </article>
  );
}

export default RecommendationCard;
