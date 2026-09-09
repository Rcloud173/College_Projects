const express = require("express");
const Rating = require("../models/Rating");
const Book = require("../models/Book");
const { auth } = require("../middleware/auth");
const { refreshBookRating } = require("../utils/ratings");

const router = express.Router();

router.use(auth);

router.get("/me", async (req, res) => {
  const ratings = await Rating.find({ user: req.user.id })
    .populate("book")
    .sort({ updatedAt: -1 });
  res.json({ ratings });
});

router.get("/book/:bookId", async (req, res) => {
  const rating = await Rating.findOne({
    user: req.user.id,
    book: req.params.bookId,
  });
  res.json({ rating: rating ? rating.rating : null });
});

router.post("/", async (req, res) => {
  try {
    const { bookId, rating } = req.body || {};
    const value = Number(rating);

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required." });
    }

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const existing = await Rating.findOne({ user: req.user.id, book: bookId });

    if (existing) {
      existing.rating = value;
      await existing.save();
    } else {
      await Rating.create({
        user: req.user.id,
        book: bookId,
        rating: value,
      });
    }

    const { book: updatedBook } = await refreshBookRating(bookId);
    const saved = await Rating.findOne({ user: req.user.id, book: bookId }).populate("book");

    res.status(existing ? 200 : 201).json({
      rating: saved,
      book: updatedBook,
      message: existing
        ? "Your rating for this book was updated."
        : "Rating saved.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already rated this book." });
    }
    res.status(500).json({ message: "Could not save rating." });
  }
});

module.exports = router;
