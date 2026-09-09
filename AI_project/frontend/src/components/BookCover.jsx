import { useState } from "react";

const CLOTH = {
  Programming: "bg-[#3e4a58]",
  "AI/ML": "bg-[#4a3f52]",
  Database: "bg-[#3d524c]",
  Business: "bg-[#5a4a38]",
  Science: "bg-[#3a4e4a]",
  Fiction: "bg-[#5a3d42]",
  History: "bg-[#4e4336]",
  "Self Development": "bg-[#3f4d3c]",
};

function BookCover({ book, className = "" }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(book?.coverImage) && !failed;
  const cloth = CLOTH[book?.genre] || "bg-[#4a453e]";

  if (showImage) {
    return (
      <img
        src={book.coverImage}
        alt={book?.title ? `Cover of ${book.title}` : "Book cover"}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex h-full w-full flex-col justify-end border border-black/10 p-2.5 text-[#f6f1e8] ${cloth} ${className}`}>
      <span className="line-clamp-5 text-[13px] font-semibold leading-snug">{book?.title}</span>
      {book?.author ? <span className="mt-1 line-clamp-2 text-[11px] opacity-80">{book.author}</span> : null}
    </div>
  );
}

export default BookCover;
