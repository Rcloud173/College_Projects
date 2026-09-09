require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");

require("./models/User");
require("./models/Book");
require("./models/Borrow");
require("./models/Rating");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Smart Library Book Recommendation System API" });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
