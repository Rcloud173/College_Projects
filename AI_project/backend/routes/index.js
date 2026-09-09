const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./auth");
const bookRoutes = require("./books");
const borrowRoutes = require("./borrows");
const profileRoutes = require("./profile");
const ratingRoutes = require("./ratings");
const recommendationRoutes = require("./recommendations");
const adminRoutes = require("./admin");

const router = express.Router();

router.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    ok: true,
    message: "Smart Library API is running",
    database: dbStatus[dbState] || "unknown",
  });
});

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/borrows", borrowRoutes);
router.use("/profile", profileRoutes);
router.use("/ratings", ratingRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
