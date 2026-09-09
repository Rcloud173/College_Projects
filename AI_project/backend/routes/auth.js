const express = require("express");
const User = require("../models/User");
const { createToken } = require("../utils/token");
const { auth } = require("../middleware/auth");
const { filterInterests } = require("../constants/student");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, year, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const parsedYear = year === undefined || year === "" ? undefined : Number(year);
    if (parsedYear !== undefined && ![1, 2, 3, 4].includes(parsedYear)) {
      return res.status(400).json({ message: "Year must be 1, 2, 3, or 4." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      department: department ? String(department).trim() : "",
      year: parsedYear,
      interests: filterInterests(interests),
    });

    const token = createToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Could not register. Try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Could not log in. Try again." });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.json({ user });
});

module.exports = router;
