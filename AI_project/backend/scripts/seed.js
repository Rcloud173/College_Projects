require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");

const ML_CATALOG_PATH = path.join(__dirname, "..", "ml", "data", "processed", "library_catalog.csv");

const books = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    description: "A widely used textbook covering core algorithms and data structures.",
    genre: "Programming",
    rating: 0,
    totalCopies: 5,
    availableCopies: 5,
    coverImage: "",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "Practical advice for writing readable, maintainable software.",
    genre: "Programming",
    rating: 0,
    totalCopies: 4,
    availableCopies: 4,
    coverImage: "",
  },
  {
    title: "Hands-On Machine Learning",
    author: "Aurélien Géron",
    description: "Practical machine learning with scikit-learn, Keras, and TensorFlow.",
    genre: "AI/ML",
    rating: 0,
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "",
  },
  {
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    description: "A complete introduction to database design, SQL, and storage.",
    genre: "Database",
    rating: 0,
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A classic novel about manners, marriage, and misunderstanding.",
    genre: "Fiction",
    rating: 0,
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins joins a quest across Middle-earth.",
    genre: "Fiction",
    rating: 0,
    totalCopies: 4,
    availableCopies: 4,
    coverImage: "",
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description: "An accessible look at space, time, and the universe.",
    genre: "Science",
    rating: 0,
    totalCopies: 2,
    availableCopies: 2,
    coverImage: "",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description: "A history of humankind from ancient times to the modern world.",
    genre: "History",
    rating: 0,
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description: "Timeless lessons on wealth, greed, and happiness.",
    genre: "Business",
    rating: 0,
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A practical guide to building good habits and breaking bad ones.",
    genre: "Self Development",
    rating: 0,
    totalCopies: 1,
    availableCopies: 1,
    coverImage: "",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 20000,
  });

  const dbName = mongoose.connection.name;
  console.log("Seeding database:", dbName);

  if (dbName !== "smart_library") {
    throw new Error("Refusing to seed: MONGO_URI must target the smart_library database.");
  }

  for (const book of books) {
    const existing = await Book.findOne({ title: book.title });
    if (existing) {
      existing.genre = book.genre;
      await existing.save();
    } else {
      await Book.create(book);
      console.log(`Added book: ${book.title}`);
    }
  }
  console.log("Books synced with recommendation genres");

  await seedMlCatalog();

  const adminEmail = "admin@library.test";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Library Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
    });
    console.log("Created admin user: admin@library.test / admin123");
  } else {
    console.log("Admin user already exists");
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((item) => item.length > 1 || (item[0] && item[0].trim()));
}

function genreFromRow(record) {
  const category = (record.category || "").split(";")[0].trim();
  const theme = (record.theme || "").split(";")[0].trim();
  return category || theme;
}

async function seedMlCatalog() {
  if (!fs.existsSync(ML_CATALOG_PATH)) {
    console.log("ML catalog CSV not found, skipping ISBN catalog seed");
    return;
  }

  const raw = fs.readFileSync(ML_CATALOG_PATH, "utf8");
  const rows = parseCsv(raw);
  const header = rows[0].map((item) => item.trim());
  let added = 0;
  let updated = 0;

  for (const values of rows.slice(1)) {
    const record = {};
    header.forEach((key, index) => {
      record[key] = values[index] === undefined ? "" : values[index];
    });

    const isbn = String(record.isbn || "").trim();
    if (!isbn || !record.title || !record.author) continue;

    const genre = genreFromRow(record);
    if (!genre) continue;

    const payload = {
      title: record.title.trim(),
      author: record.author.trim(),
      description: (record.description || "").trim(),
      genre,
      isbn,
      rating: 0,
      totalCopies: 3,
      availableCopies: 3,
      coverImage: "",
    };

    const existing = await Book.findOne({ isbn });
    if (existing) {
      existing.title = payload.title;
      existing.author = payload.author;
      existing.description = payload.description;
      existing.genre = payload.genre;
      await existing.save();
      updated += 1;
    } else {
      await Book.create(payload);
      added += 1;
    }
  }

  console.log(`ML catalog seed: added ${added}, updated ${updated}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
