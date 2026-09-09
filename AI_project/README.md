# Smart Library Book Recommendation System

A college library web app that lets students browse, borrow, and rate books, then get **simple, explainable** recommendations from their interests, borrowing history, and ratings.

This is not a machine-learning or LLM project. Recommendations use a weighted score you can explain in a presentation.

## What it does

**Students can:**

- Register and log in
- Set department, year, and interests
- Search and filter books by genre
- View book details
- Borrow and return books
- Rate books from 1–5 (one rating per book)
- See currently borrowed books and borrowing history
- Get personalized recommendations on the Home dashboard and For You page

**Librarians / admins can:**

- See totals (books, students, currently borrowed, overdue)
- See most borrowed books and popular genres
- Add, edit, and delete books
- View all borrowing records

A book counts as **overdue** if it has been checked out for more than **14 days**.

## Recommendation score

Each candidate book gets a score from 0 to 1:

| Part | Weight | Meaning |
| --- | --- | --- |
| Interest / genre match | 40% | Book genre matches (or is related to) the student’s interests |
| Similar to borrowed books | 30% | Same or related genre as books the student borrowed before |
| Book rating | 30% | Average rating of the book, divided by 5 |

**Rules:**

- Books the student has already borrowed are excluded
- New users still get recommendations (mainly from ratings / catalog)
- The UI shows a match percentage and a short reason, for example:  
  *“Recommended because it matches your interest in AI and is similar to books you previously borrowed.”*

The scoring code is in `backend/recommend/recommend.js`.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)

## How to run

### 1. Requirements

- Node.js
- A MongoDB Atlas cluster (this project uses database **`smart_library`**)

In Atlas **Network Access**, allow your current IP (or `0.0.0.0/0` for local college testing). The app must **not** use the `trello-clone` database on the same cluster.

### 2. Install packages

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Environment variables

Copy `backend/.env.example` to `backend/.env` if `.env` is missing, then set your Atlas URI.

`backend/.env` should look like:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_library?retryWrites=true&w=majority
JWT_SECRET=change-this-secret
```

- The database name in the URI must be **`smart_library`**
- Do not commit `.env` (it is gitignored)
- Do not put real passwords in `.env.example` or this README

When the API starts successfully you should see: `MongoDB connected: smart_library`

### 4. Seed sample data

```bash
cd backend
npm run seed
```

This writes sample books and a librarian account into **`smart_library` only**. The seed script refuses to run if the connected database is not `smart_library`.

### 5. Start the servers

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

API: http://localhost:5000

**Terminal 2 — website**

```bash
cd frontend
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` to the backend, so keep both running.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Librarian / Admin | `admin@library.test` | `admin123` |

There is no seeded student account. Register a new student, choose interests, then borrow and rate a book so recommendations look personalized.

## Suggested demo flow

1. Register as a student and pick interests (for example Programming and AI/ML)
2. Browse books, open a title, borrow it
3. Rate another book
4. Open **Home** or **For You** and explain the match percentage
5. Return the book from **My Books**
6. Log in as the librarian and show **Admin** stats and book management

## Project structure

```
AI_project/
  backend/
    models/          User, Book, Borrow, Rating
    routes/          auth, books, borrows, ratings, profile, recommendations, admin
    recommend/       scoring algorithm
    scripts/seed.js  sample books + admin user
    server.js
  frontend/
    src/pages/       student and admin screens
    src/components/  layout, recommendation cards, covers
```

## Notes for presentation

- Passwords are hashed; login uses JWT
- Students cannot create admin accounts
- Recommendations use real MongoDB Atlas data (`smart_library`), not a hardcoded list
- The algorithm is deterministic: same student data produces the same ranking
