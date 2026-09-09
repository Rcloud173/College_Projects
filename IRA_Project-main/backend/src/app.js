const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/cors");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json({ limit: "32kb" }));
app.use(cors(corsOptions));
app.use(routes);
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Not found" });
});
app.use(errorHandler);

module.exports = app;
