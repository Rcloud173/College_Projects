const express = require("express");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const Rating = require("../models/Rating");
const { auth } = require("../middleware/auth");
const { INTERESTS, DEPARTMENTS, YEARS, filterInterests } = require("../constants/student");

const router = express.Router();

router.get("/options", (req, res) => {
  res.json({ interests: INTERESTS, departments: DEPARTMENTS, years: YEARS });
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const [borrows, ratings] = await Promise.all([
    Borrow.find({ user: req.user.id }).populate("book").sort({ borrowedAt: -1 }),
    Rating.find({ user: req.user.id }).populate("book").sort({ updatedAt: -1 }),
  ]);

  res.json({ user, borrows, ratings });
});

router.put("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { department, year, interests } = req.body;

    if (department !== undefined) {
      user.department = String(department || "").trim();
    }

    if (year !== undefined && year !== "") {
      const parsed = Number(year);
      if (![1, 2, 3, 4].includes(parsed)) {
        return res.status(400).json({ message: "Year must be 1, 2, 3, or 4." });
      }
      user.year = parsed;
    }

    if (interests !== undefined) {
      user.interests = filterInterests(interests);
    }

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: "Could not update profile." });
  }
});

module.exports = router;
