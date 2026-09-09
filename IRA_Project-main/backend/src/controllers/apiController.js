const ml = require("../services/mlService");

function health(_req, res) {
  res.json({ status: "ok", service: "ira-backend" });
}

function metadata(_req, res, next) {
  try {
    res.json(ml.getMetadata());
  } catch (err) {
    next(err);
  }
}

function modelInfo(_req, res, next) {
  try {
    res.json(ml.getModelInfo());
  } catch (err) {
    next(err);
  }
}

function analytics(_req, res, next) {
  try {
    res.json(ml.getAnalytics());
  } catch (err) {
    next(err);
  }
}

async function predict(req, res, next) {
  try {
    const result = await ml.predict(req.validated);
    res.json({ ok: true, input: req.validated, prediction: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { health, metadata, modelInfo, analytics, predict };
