const LOAN_DAYS = 14;

function overdueCutoff(now = new Date()) {
  return new Date(now.getTime() - LOAN_DAYS * 24 * 60 * 60 * 1000);
}

function dueDate(borrowedAt) {
  return new Date(new Date(borrowedAt).getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);
}

module.exports = { LOAN_DAYS, overdueCutoff, dueDate };
