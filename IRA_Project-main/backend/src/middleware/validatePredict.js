const REQUIRED = [
  "attendance",
  "current_test_score",
  "current_assignment_score",
  "previous_test_score",
  "previous_assignment_score",
  "fees",
  "gender",
];

function asNumber(value, field, min, max) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    const err = new Error(`${field} must be a number`);
    err.status = 400;
    throw err;
  }
  if (n < min || n > max) {
    const err = new Error(`${field} must be between ${min} and ${max}`);
    err.status = 400;
    throw err;
  }
  return n;
}

function validatePredict(req, res, next) {
  try {
    const body = req.body || {};
    for (const field of REQUIRED) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        const err = new Error(`Missing required field: ${field}`);
        err.status = 400;
        throw err;
      }
    }
    req.validated = {
      attendance: asNumber(body.attendance, "attendance", 0, 100),
      current_test_score: asNumber(body.current_test_score, "current_test_score", 0, 100),
      current_assignment_score: asNumber(
        body.current_assignment_score,
        "current_assignment_score",
        0,
        100
      ),
      previous_test_score: asNumber(body.previous_test_score, "previous_test_score", 0, 100),
      previous_assignment_score: asNumber(
        body.previous_assignment_score,
        "previous_assignment_score",
        0,
        100
      ),
      fees: String(body.fees),
      gender: String(body.gender),
    };
    if (!["Paid", "Unpaid"].includes(req.validated.fees)) {
      const err = new Error("fees must be Paid or Unpaid");
      err.status = 400;
      throw err;
    }
    if (!["Male", "Female"].includes(req.validated.gender)) {
      const err = new Error("gender must be Male or Female");
      err.status = 400;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = validatePredict;
