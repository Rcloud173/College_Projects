const express = require("express");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", async (req, res) => {
  try {
    const { bookId } = req.body || {};
    if (!bookId) {
      return res.status(400).json({ message: "bookId is required." });
    }

    const alreadyBorrowed = await Borrow.findOne({
      user: req.user.id,
      book: bookId,
      status: "borrowed",
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: "You already have this book borrowed." });
    }

    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!book) {
      const exists = await Book.findById(bookId);
      if (!exists) {
        return res.status(404).json({ message: "Book not found." });
      }
      return res.status(400).json({ message: "No copies available to borrow." });
    }

    try {
      const borrow = await Borrow.create({
        user: req.user.id,
        book: bookId,
        status: "borrowed",
      });
      const populated = await borrow.populate("book");
      return res.status(201).json({ borrow: populated, book });
    } catch (error) {
      await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
      if (error.code === 11000) {
        return res.status(400).json({ message: "You already have this book borrowed." });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: "Could not borrow the book." });
  }
});

router.post("/:id/return", async (req, res) => {
  try {
    const borrow = await Borrow.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("book");

    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found." });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "This book is already returned." });
    }

    borrow.status = "returned";
    borrow.returnedAt = new Date();
    await borrow.save();

    const book = await Book.findByIdAndUpdate(
      borrow.book._id,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );

    if (book && book.availableCopies > book.totalCopies) {
      book.availableCopies = book.totalCopies;
      await book.save();
    }

    res.json({ borrow, book });
  } catch (error) {
    res.status(400).json({ message: "Could not return the book." });
  }
});

router.get("/active", async (req, res) => {
  const borrows = await Borrow.find({
    user: req.user.id,
    status: "borrowed",
  })
    .populate("book")
    .sort({ borrowedAt: -1 });

  res.json({ borrows });
});

router.get("/history", async (req, res) => {
  const borrows = await Borrow.find({ user: req.user.id })
    .populate("book")
    .sort({ borrowedAt: -1 });

  res.json({ borrows });
});

module.exports = router;
