const express = require("express");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search = "", genre = "" } = req.query;
    const filter = {};

    if (genre) {
      filter.genre = genre;
    }

    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { author: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const books = await Book.find(filter).sort({ title: 1 });
    res.json({ books });
  } catch (error) {
    res.status(500).json({ message: "Could not load books." });
  }
});

router.get("/genres", async (req, res) => {
  try {
    const genres = await Book.distinct("genre");
    res.json({ genres: genres.sort() });
  } catch (error) {
    res.status(500).json({ message: "Could not load genres." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.json({ book });
  } catch (error) {
    res.status(400).json({ message: "Invalid book id." });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const payload = cleanBook(req.body);
    if (payload.availableCopies === undefined) {
      payload.availableCopies = payload.totalCopies;
    }
    const book = await Book.create(payload);
    res.status(201).json({ book });
  } catch (error) {
    res.status(400).json({ message: "Could not create book. Check the fields." });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const payload = cleanBook(req.body);
    const book = await Book.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.json({ book });
  } catch (error) {
    res.status(400).json({ message: "Could not update book." });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const active = await Borrow.countDocuments({
      book: req.params.id,
      status: "borrowed",
    });
    if (active > 0) {
      return res.status(400).json({
        message: "Cannot delete a book that is currently borrowed.",
      });
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.json({ message: "Book deleted.", book });
  } catch (error) {
    res.status(400).json({ message: "Could not delete book." });
  }
});

module.exports = router;

function cleanBook(body = {}) {
  const totalCopies = Number(body.totalCopies);
  let availableCopies =
    body.availableCopies === undefined || body.availableCopies === ""
      ? undefined
      : Number(body.availableCopies);

  if (availableCopies !== undefined && availableCopies > totalCopies) {
    availableCopies = totalCopies;
  }

  const payload = {
    title: body.title,
    author: body.author,
    description: body.description || "",
    genre: body.genre,
    totalCopies,
    coverImage: body.coverImage || "",
    isbn: body.isbn === undefined || body.isbn === null ? undefined : String(body.isbn).trim(),
  };

  if (availableCopies !== undefined) {
    payload.availableCopies = availableCopies;
  }

  return payload;
}
