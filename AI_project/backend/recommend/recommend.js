/**
 * Item-item collaborative filtering using frozen Book-Crossing neighbors.
 * Kaggle user IDs are never used. Students are MongoDB users; books map by ISBN.
 */

const fs = require("fs");
const path = require("path");

const WEIGHTS = {
  method: "item-item-cf",
  neighborLimit: 50,
};

const NEIGHBORS_PATH = path.join(__dirname, "..", "ml", "artifacts", "item_neighbors.json");

let cachedNeighbors = null;

function loadNeighbors() {
  if (cachedNeighbors) return cachedNeighbors;
  try {
    const raw = fs.readFileSync(NEIGHBORS_PATH, "utf8");
    cachedNeighbors = JSON.parse(raw);
  } catch {
    cachedNeighbors = {};
  }
  return cachedNeighbors;
}

function bookId(book) {
  if (!book) return "";
  return String(book._id || book.id || book);
}

function normalizeIsbn(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function displayScore(raw, maxRaw) {
  if (!maxRaw || maxRaw <= 0) return 0;
  return Math.round((raw / maxRaw) * 1000) / 1000;
}

function popularityFallback({ books, excludedIds, limit }) {
  const excluded = new Set((excludedIds || []).map(String));
  const ranked = (books || [])
    .filter((book) => book && !excluded.has(bookId(book)))
    .sort((a, b) => {
      const availA = (a.availableCopies || 0) > 0 ? 1 : 0;
      const availB = (b.availableCopies || 0) > 0 ? 1 : 0;
      if (availB !== availA) return availB - availA;
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return String(a.title).localeCompare(String(b.title));
    })
    .slice(0, limit)
    .map((book) => ({
      book,
      score: ratingScore(book.rating),
      parts: { method: "popularity-fallback" },
      weighted: {},
      reasons: ["Recommended from popular books in the library (not enough reading history for personalized ML)."],
      shortReason: "Recommended from popular books in the library.",
    }));

  return ranked;
}

function ratingScore(rating) {
  const value = Number(rating) || 0;
  return Math.max(0, Math.min(5, value)) / 5;
}

function collectSources({ books, ratings, borrows, neighbors }) {
  const byId = new Map((books || []).map((book) => [bookId(book), book]));
  const sources = [];
  const used = new Set();

  for (const item of ratings || []) {
    const id = bookId(item.book);
    const book = byId.get(id);
    const isbn = normalizeIsbn(book?.isbn);
    if (!isbn || !neighbors[isbn]) continue;
    sources.push({
      isbn,
      title: book.title,
      weight: Number(item.rating) || 1,
      kind: "rated",
    });
    used.add(id);
  }

  for (const item of borrows || []) {
    const book = item.book && typeof item.book === "object" ? item.book : byId.get(bookId(item.book));
    const id = bookId(book);
    if (!id || used.has(id)) continue;
    const isbn = normalizeIsbn(book?.isbn);
    if (!isbn || !neighbors[isbn]) continue;
    sources.push({
      isbn,
      title: book.title,
      weight: 3,
      kind: "borrowed",
    });
    used.add(id);
  }

  return sources;
}

function recommendMl({ books, sources, excludedIds, neighbors, limit }) {
  const excluded = new Set((excludedIds || []).map(String));
  const byIsbn = new Map();
  for (const book of books || []) {
    const isbn = normalizeIsbn(book.isbn);
    if (isbn) byIsbn.set(isbn, book);
  }

  const scores = new Map();
  const reasonTitles = new Map();

  for (const source of sources) {
    const list = neighbors[source.isbn] || [];
    for (const neighbor of list) {
      const candidateIsbn = normalizeIsbn(neighbor.isbn);
      if (!candidateIsbn || candidateIsbn === source.isbn) continue;
      const book = byIsbn.get(candidateIsbn);
      if (!book) continue;
      const id = bookId(book);
      if (excluded.has(id)) continue;
      const add = (Number(neighbor.score) || 0) * source.weight;
      scores.set(id, (scores.get(id) || 0) + add);
      if (!reasonTitles.has(id)) reasonTitles.set(id, []);
      const titles = reasonTitles.get(id);
      if (source.title && !titles.includes(source.title)) titles.push(source.title);
    }
  }

  const byId = new Map((books || []).map((book) => [bookId(book), book]));
  const rankedIds = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const bookA = byId.get(a[0]);
    const bookB = byId.get(b[0]);
    const availA = (bookA?.availableCopies || 0) > 0 ? 1 : 0;
    const availB = (bookB?.availableCopies || 0) > 0 ? 1 : 0;
    if (availB !== availA) return availB - availA;
    return String(bookA?.title || "").localeCompare(String(bookB?.title || ""));
  });

  const maxRaw = rankedIds.length ? rankedIds[0][1] : 0;

  return rankedIds.slice(0, limit).map(([id, raw]) => {
    const book = byId.get(id);
    const titles = reasonTitles.get(id) || [];
    const sourceTitle = titles[0];
    const shortReason = sourceTitle
      ? `Similar to ${sourceTitle}`
      : "Based on your reading history";
    const reasons = [
      shortReason,
      sources.some((s) => s.kind === "rated")
        ? "Similar to books you rated"
        : "Recommended from books you interacted with",
    ];
    return {
      book,
      score: displayScore(raw, maxRaw),
      parts: { method: "item-item-cf", rawScore: Math.round(raw * 1000) / 1000 },
      weighted: {},
      reasons,
      shortReason,
    };
  });
}

function recommendBooks({
  books,
  borrowedBookIds,
  ratedBookIds,
  ratings,
  borrows,
  interests,
  borrowedGenres,
  neighbors,
  limit = 8,
} = {}) {
  const neighborMap = neighbors || loadNeighbors();
  const excludedIds = [
    ...(borrowedBookIds || []).map(String),
    ...(ratedBookIds || []).map(String),
  ];

  const sources = collectSources({ books, ratings, borrows, neighbors: neighborMap });

  if (sources.length > 0) {
    const mlRecs = recommendMl({
      books,
      sources,
      excludedIds,
      neighbors: neighborMap,
      limit,
    });
    if (mlRecs.length > 0) return mlRecs;
  }

  return popularityFallback({ books, excludedIds, limit });
}

module.exports = {
  WEIGHTS,
  loadNeighbors,
  recommendBooks,
  collectSources,
  popularityFallback,
};
