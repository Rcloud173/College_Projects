const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const Book = require("../models/Book");

async function refreshBookRating(bookId) {
  const id = mongoose.Types.ObjectId.createFromHexString(String(bookId));
  const stats = await Rating.aggregate([
    { $match: { book: id } },
    { $group: { _id: "$book", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0;
  const book = await Book.findByIdAndUpdate(bookId, { rating: avg }, { new: true });
  return { book, average: avg, count: stats[0]?.count || 0 };
}

module.exports = { refreshBookRating };
