const { recommendBooks, loadNeighbors } = require("../recommend/recommend");

function book(id, isbn, title, extra = {}) {
  return {
    _id: id,
    isbn,
    title,
    author: "Author",
    genre: "Fiction",
    rating: extra.rating ?? 0,
    availableCopies: extra.availableCopies ?? 3,
    totalCopies: 3,
  };
}

const neighbors = loadNeighbors();
const catalogIsbns = Object.keys(neighbors);
if (catalogIsbns.length < 3) {
  throw new Error("item_neighbors.json missing or too small");
}

const sourceIsbn = catalogIsbns[0];
const neighborIsbn = neighbors[sourceIsbn][0].isbn;
const otherIsbn = neighbors[sourceIsbn][1].isbn;

const books = [
  book("src", sourceIsbn, "Source Book"),
  book("n1", neighborIsbn, "Neighbor One"),
  book("n2", otherIsbn, "Neighbor Two"),
  book("old", "", "No ISBN Textbook", { rating: 5 }),
  book("ghost", "9999999999", "Unknown ISBN"),
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const mlRecs = recommendBooks({
  books,
  ratings: [{ book: "src", rating: 5 }],
  borrows: [],
  borrowedBookIds: [],
  ratedBookIds: ["src"],
  neighbors,
  limit: 8,
});

assert(mlRecs.length > 0, "ML recs should not be empty");
assert(
  mlRecs.every((item) => item.book && item.book._id !== "src"),
  "source book must be excluded"
);
assert(
  mlRecs.every((item) => ["n1", "n2"].includes(item.book._id)),
  "ML recs must be in the provided catalog"
);
assert(!mlRecs.some((item) => item.book._id === "ghost"), "unknown ISBN must not be recommended");
assert(typeof mlRecs[0].shortReason === "string", "shortReason required");
assert(mlRecs[0].score >= 0 && mlRecs[0].score <= 1, "display score 0-1");
console.log("PASS: student with ratings gets ML recs", mlRecs.map((r) => r.book.title));

const excluded = recommendBooks({
  books,
  ratings: [{ book: "src", rating: 5 }],
  borrows: [{ book: books[1] }],
  borrowedBookIds: ["n1"],
  ratedBookIds: ["src"],
  neighbors,
  limit: 8,
});
assert(
  excluded.every((item) => item.book._id !== "n1" && item.book._id !== "src"),
  "borrowed neighbor must be excluded"
);
console.log("PASS: borrowed books excluded");

const fallback = recommendBooks({
  books,
  ratings: [],
  borrows: [],
  borrowedBookIds: [],
  ratedBookIds: [],
  neighbors,
  limit: 8,
});
assert(fallback.length > 0, "fallback should return books");
assert(
  fallback[0].shortReason.includes("popular") || fallback[0].parts.method === "popularity-fallback",
  "no-history uses fallback"
);
console.log("PASS: cold start fallback", fallback[0].book.title);

const unknown = recommendBooks({
  books,
  ratings: [{ book: "ghost", rating: 5 }],
  borrows: [],
  borrowedBookIds: [],
  ratedBookIds: ["ghost"],
  neighbors,
  limit: 8,
});
assert(unknown.length > 0, "unknown ISBN should not crash");
assert(unknown[0].parts.method === "popularity-fallback", "unknown ISBN falls back");
console.log("PASS: unknown ISBN does not crash");

const noIsbn = recommendBooks({
  books,
  ratings: [{ book: "old", rating: 5 }],
  borrows: [],
  borrowedBookIds: [],
  ratedBookIds: ["old"],
  neighbors,
  limit: 5,
});
assert(noIsbn.length > 0, "book without ISBN should not crash");
console.log("PASS: missing ISBN does not crash");

console.log("All recommendation unit checks passed.");
