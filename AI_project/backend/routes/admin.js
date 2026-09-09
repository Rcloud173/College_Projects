const express = require("express");
const Book = require("../models/Book");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const { auth, adminOnly } = require("../middleware/auth");
const { LOAN_DAYS, overdueCutoff, dueDate } = require("../constants/loans");

const router = express.Router();

router.use(auth, adminOnly);

router.get("/stats", async (req, res) => {
  try {
    const cutoff = overdueCutoff();

    const [totalBooks, totalStudents, currentlyBorrowed, overdueCount, mostBorrowed, popularGenres] =
      await Promise.all([
        Book.countDocuments(),
        User.countDocuments({ role: "student" }),
        Borrow.countDocuments({ status: "borrowed" }),
        Borrow.countDocuments({ status: "borrowed", borrowedAt: { $lt: cutoff } }),
        Borrow.aggregate([
          { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
          { $sort: { borrowCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "books",
              localField: "_id",
              foreignField: "_id",
              as: "book",
            },
          },
          { $unwind: "$book" },
          {
            $project: {
              _id: 0,
              bookId: "$book._id",
              title: "$book.title",
              author: "$book.author",
              genre: "$book.genre",
              borrowCount: 1,
            },
          },
        ]),
        Borrow.aggregate([
          {
            $lookup: {
              from: "books",
              localField: "book",
              foreignField: "_id",
              as: "book",
            },
          },
          { $unwind: "$book" },
          { $group: { _id: "$book.genre", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
          { $project: { _id: 0, genre: "$_id", count: 1 } },
        ]),
      ]);

    res.json({
      loanDays: LOAN_DAYS,
      totals: {
        totalBooks,
        totalStudents,
        currentlyBorrowed,
        overdueBooks: overdueCount,
      },
      mostBorrowed,
      popularGenres,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load admin stats." });
  }
});

router.get("/borrows", async (req, res) => {
  try {
    const cutoff = overdueCutoff();
    const borrows = await Borrow.find()
      .populate("user", "name email role")
      .populate("book", "title author genre")
      .sort({ borrowedAt: -1 })
      .limit(100);

    res.json({
      loanDays: LOAN_DAYS,
      borrows: borrows.map((item) => {
        const obj = item.toObject();
        const overdue = obj.status === "borrowed" && obj.borrowedAt < cutoff;
        return {
          ...obj,
          dueDate: dueDate(obj.borrowedAt),
          overdue,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load borrow records." });
  }
});

module.exports = router;
