require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 8040,
  pythonBin: process.env.PYTHON_BIN || "python3",
  frontendOrigins: (process.env.FRONTEND_ORIGINS ||
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
