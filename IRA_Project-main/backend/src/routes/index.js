const express = require("express");
const validatePredict = require("../middleware/validatePredict");
const api = require("../controllers/apiController");

const router = express.Router();

router.get("/health", api.health);
router.get("/metadata", api.metadata);
router.get("/model-info", api.modelInfo);
router.get("/analytics", api.analytics);
router.post("/predict", validatePredict, api.predict);

module.exports = router;
