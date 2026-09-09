/**
 * Hybrid book recommendation (college project).
 *
 * Final score = 40% interest match + 30% previous-genre similarity + 30% rating.
 * Each part is a number from 0 to 1. The final score is also 0 to 1.
 *
 * No machine learning: exact / related genre rules + average book rating.
 */

const WEIGHTS = {
  interest: 0.4,
  previousGenre: 0.3,
  rating: 0.3,
};

const RELATED_GENRES = {
  Programming: ["AI/ML", "Database"],
  "AI/ML": ["Programming", "Database", "Science"],
  Database: ["Programming", "AI/ML"],
  Science: ["AI/ML"],
  Business: ["Self Development"],
  "Self Development": ["Business"],
  Fiction: [],
  History: [],
};

function relatedTo(genre) {
  return RELATED_GENRES[genre] || [];
}

function isRelated(genreA, genreB) {
  if (!genreA || !genreB) return false;
  return relatedTo(genreA).includes(genreB) || relatedTo(genreB).includes(genreA);
}

function interestScore(bookGenre, interests) {
  const list = Array.isArray(interests) ? interests : [];
  if (list.includes(bookGenre)) return 1;
  if (list.some((interest) => isRelated(interest, bookGenre))) return 0.5;
  return 0;
}

function previousGenreScore(bookGenre, borrowedGenres) {
  const list = Array.isArray(borrowedGenres) ? borrowedGenres : [];
  if (list.length === 0) return 0;
  if (list.includes(bookGenre)) return 1;
  if (list.some((genre) => isRelated(genre, bookGenre))) return 0.5;
  return 0;
}

function ratingScore(rating) {
  const value = Number(rating) || 0;
  return Math.max(0, Math.min(5, value)) / 5;
}

function buildReasons(book, parts, { interests, borrowedGenres }) {
  const reasons = [];

  if (parts.interest === 1) {
    reasons.push(`Genre "${book.genre}" matches your interests (${interests.join(", ")}).`);
  } else if (parts.interest === 0.5) {
    reasons.push(`Genre "${book.genre}" is related to your interests.`);
  }

  if (parts.previousGenre === 1) {
    reasons.push(`Same genre as a book you borrowed before (${book.genre}).`);
  } else if (parts.previousGenre === 0.5) {
    reasons.push(
      `Genre is similar to books you borrowed (${[...new Set(borrowedGenres)].join(", ")}).`
    );
  }

  if (parts.rating >= 0.8) {
    reasons.push(`Highly rated (${book.rating}/5).`);
  } else if (parts.rating > 0) {
    reasons.push(`Average rating ${book.rating}/5.`);
  } else {
    reasons.push("Not enough ratings yet, so the rating part is 0.");
  }

  if (reasons.length === 1 && parts.interest === 0 && parts.previousGenre === 0) {
    reasons.unshift("Shown mainly because of ratings (limited interest/history data).");
  }

  return reasons;
}

function shortReason(book, parts, { interests }) {
  const list = interests || [];
  const exact = list.filter((interest) => interest === book.genre);
  const related = list.filter(
    (interest) => interest !== book.genre && isRelated(interest, book.genre)
  );
  const matched = exact.length ? exact : related;
  const labels = [...new Set(matched.map((name) => (name === "AI/ML" ? "AI" : name)))];
  const interestText = labels.length
    ? `it matches your interest in ${labels.slice(0, 2).join(" and ")}`
    : "";

  if (parts.interest > 0 && parts.previousGenre > 0 && interestText) {
    return `Recommended because ${interestText} and is similar to books you previously borrowed.`;
  }
  if (parts.interest > 0 && interestText) {
    return `Recommended because ${interestText}.`;
  }
  if (parts.previousGenre > 0) {
    return "Recommended because it is similar to books you previously borrowed.";
  }
  if (parts.rating >= 0.8) {
    return "Recommended because it is highly rated.";
  }
  return "Recommended from popular books in the library.";
}

function scoreBook(book, context) {
  const parts = {
    interest: interestScore(book.genre, context.interests),
    previousGenre: previousGenreScore(book.genre, context.borrowedGenres),
    rating: ratingScore(book.rating),
  };

  const total =
    WEIGHTS.interest * parts.interest +
    WEIGHTS.previousGenre * parts.previousGenre +
    WEIGHTS.rating * parts.rating;

  return {
    book,
    score: Math.round(total * 1000) / 1000,
    parts: {
      interest: Math.round(parts.interest * 100) / 100,
      previousGenre: Math.round(parts.previousGenre * 100) / 100,
      rating: Math.round(parts.rating * 100) / 100,
    },
    weighted: {
      interest: Math.round(WEIGHTS.interest * parts.interest * 1000) / 1000,
      previousGenre: Math.round(WEIGHTS.previousGenre * parts.previousGenre * 1000) / 1000,
      rating: Math.round(WEIGHTS.rating * parts.rating * 1000) / 1000,
    },
    reasons: buildReasons(book, parts, context),
    shortReason: shortReason(book, parts, context),
  };
}

function recommendBooks({
  books,
  borrowedBookIds,
  interests,
  borrowedGenres,
  limit = 8,
}) {
  const borrowed = new Set((borrowedBookIds || []).map((id) => String(id)));
  const context = {
    interests: interests || [],
    borrowedGenres: borrowedGenres || [],
  };

  const ranked = (books || [])
    .filter((book) => book && !borrowed.has(String(book._id)))
    .map((book) => scoreBook(book, context))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ratingDiff = (b.book.rating || 0) - (a.book.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return String(a.book.title).localeCompare(String(b.book.title));
    });

  return ranked.slice(0, limit);
}

module.exports = {
  WEIGHTS,
  RELATED_GENRES,
  interestScore,
  previousGenreScore,
  ratingScore,
  scoreBook,
  recommendBooks,
};
