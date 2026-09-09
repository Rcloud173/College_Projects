require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const calculationsRouter = require("./routes/calculations");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "AgeLens API is running" });
});

app.use("/api/calculations", calculationsRouter);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`AgeLens backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
