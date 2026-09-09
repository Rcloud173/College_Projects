const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { auth } = require("../middleware/auth");
const { recommendBooks, WEIGHTS } = require("../recommend/recommend");

const router = require("express").Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const [books, borrows] = await Promise.all([
      Book.find(),
      Borrow.find({ user: req.user.id }).populate("book"),
    ]);

    const borrowedBookIds = borrows
      .map((item) => item.book?._id || item.book)
      .filter(Boolean);

    const borrowedGenres = borrows
      .map((item) => item.book?.genre)
      .filter(Boolean);

    const recommendations = recommendBooks({
      books,
      borrowedBookIds,
      interests: user.interests,
      borrowedGenres,
      limit: 8,
    });

    res.json({
      weights: WEIGHTS,
      student: {
        interests: user.interests,
        borrowedGenres: [...new Set(borrowedGenres)],
        borrowedCount: borrowedBookIds.length,
      },
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not build recommendations." });
  }
});

module.exports = router;
