const INTERESTS = [
  "Programming",
  "AI/ML",
  "Database",
  "Business",
  "Science",
  "Fiction",
  "History",
  "Self Development",
];

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Business",
  "Other",
];

const YEARS = [1, 2, 3, 4];

function filterInterests(interests) {
  if (!Array.isArray(interests)) return [];
  return [...new Set(interests.filter((item) => INTERESTS.includes(item)))];
}

module.exports = { INTERESTS, DEPARTMENTS, YEARS, filterInterests };
