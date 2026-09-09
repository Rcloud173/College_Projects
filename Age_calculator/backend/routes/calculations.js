const express = require("express");
const Calculation = require("../models/Calculation");

const router = express.Router();

/**
 * POST /api/calculations
 * Body: { name?, birthDate, calculationType, result }
 */
router.post("/", async (req, res) => {
  try {
    const { name, birthDate, calculationType, result } = req.body;

    if (!birthDate || !calculationType || result === undefined) {
      return res.status(400).json({
        error: "birthDate, calculationType, and result are required"
      });
    }

    const saved = await Calculation.create({
      name: name || null,
      birthDate,
      calculationType,
      result
    });

    return res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/calculations error:", err.message);
    return res.status(500).json({ error: "Failed to save calculation" });
  }
});

/**
 * GET /api/calculations
 * Returns newest first.
 */
router.get("/", async (_req, res) => {
  try {
    const items = await Calculation.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error("GET /api/calculations error:", err.message);
    return res.status(500).json({ error: "Failed to load calculations" });
  }
});

/**
 * DELETE /api/calculations/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Calculation.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Calculation not found" });
    }

    return res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/calculations/:id error:", err.message);
    return res.status(500).json({ error: "Failed to delete calculation" });
  }
});

module.exports = router;
