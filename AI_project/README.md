# Smart Library Book Recommendation System

Smart Library is a college library management and book recommendation web application. Students can browse the catalog, borrow and return books, rate titles, and receive personalized suggestions. Librarians can manage books and borrowing records.

This is a college project, not a production system.

## Application features

**Students**

- Register and log in (JWT; passwords hashed with bcrypt)
- Set department, year, and subject interests
- Browse the catalog; search by title or author; filter by genre
- View book details
- Borrow and return books (loans are overdue after 14 days)
- Rate books from 1–5 (one rating per book)
- See currently borrowed books (My Books) and borrowing history
- Personalized recommendations on Home and the For You page
- Update profile information

**Librarians / admins**

- Dashboard totals: books, students, currently borrowed, overdue
- Most borrowed books and popular genres
- Add, edit, and delete books
- View all borrowing records

Students cannot create admin accounts through registration.

## Technology stack

**Frontend:** React, Vite, Tailwind CSS, React Router

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt

**ML (notebook / training):** Python, Jupyter, pandas, NumPy, scikit-learn, TF-IDF, cosine similarity. Matplotlib and seaborn are used for EDA plots.

The live API does not run Python. It loads a precomputed neighbor file in Node.js.

## Recommendation system

**Final application model: item–item collaborative filtering** (not deep learning and not generative AI).

Book-Crossing ratings are used to learn relationships between books. Each book is represented by how Kaggle users rated it. Cosine similarity identifies similar books.

At recommendation time, the application uses a **MongoDB student’s** borrowed and rated library books (mapped by ISBN), ranks similar candidate books, and **keeps only titles that exist in the library catalog**.

Kaggle `User-ID` values are not mapped to application students. The Kaggle data teaches book-to-book similarity; students use their own library history.

The match percentage in the UI is a **relative similarity score**, not Hit@10 and not model accuracy.

## Datasets

Two public datasets under `backend/ml/data/raw/` (raw files were not modified):

| Dataset | Files / fields used |
| --- | --- |
| Book-Crossing / Book Recommendation Dataset | `Books.csv`, `Users.csv`, `Ratings.csv` |
| BookCrossing with Themes | Theme, category, and description metadata |

Raw CSVs stay in `data/raw/`. Cleaned tables are written to `backend/ml/data/processed/`.

## Data processing

Major steps (see the notebook):

- ISBN normalization (short numeric / `X` values padded; ISBN-13 kept)
- Explicit ratings **1–10** used for modeling
- Rating **0** treated as implicit and kept separate
- Invalid user ages treated as missing (age is not a model feature)
- Missing book metadata handled without inventing real titles, authors, or genres
- Themes aggregated to one row per ISBN
- Interaction filtering, then iterative **5/5** user/book filtering for modeling

**Modeling set:** 6,864 users × 9,098 books, 115,460 ratings.

## Model evaluation

Leave-one-out split (seed 42): 108,596 training ratings and 6,864 held-out ratings.

**Hit@10** is the share of users whose held-out book appears in the top 10 suggestions. It is not accuracy.

| Model | Hit@10 | Precision@10 |
| --- | ---: | ---: |
| Popularity | 2.07% | 0.21% |
| Item-Item CF | 6.51% | 0.65% |
| Content TF-IDF | 3.27% | 0.33% |
| Hybrid 70/30 | 6.67% | 0.67% |
| Hybrid 80/20 | 6.61% | 0.66% |

**Item–item CF is the final application model.** A hybrid mix was tested; the extra Hit@10 was small, so the simpler CF model was kept.

## Application integration

```
Student borrowed / rated books
  → ISBN
  → item-item neighbors
  → candidate ranking
  → keep books that exist in MongoDB
  → GET /api/recommendations
  → Home and For You
```

Runtime artifact used by Express:

- `backend/ml/artifacts/item_neighbors.json`

Also present from training:

- `backend/ml/artifacts/item_similarity.npz`
- `backend/ml/artifacts/isbn_index.json`

Implementation: `backend/recommend/recommend.js`.

## Cold start

If a student has no usable ISBN history (no rated/borrowed book in the ML index), the API returns a **popularity fallback** over the library catalog. Missing ISBNs and books outside the ML index are skipped; the request does not fail.

## ML notebook

Training, evaluation, and integration notes:

[`backend/ml/notebooks/recommendation_model.ipynb`](backend/ml/notebooks/recommendation_model.ipynb)

The notebook covers data cleaning, EDA, feature engineering, model training, evaluation, artifact generation, and how the app uses the model.

Python packages for the notebook: `backend/ml/requirements.txt`. You do not need to retrain the model to run the web app.

## Project structure

```
AI_project/
  backend/
    models/              User, Book, Borrow, Rating
    routes/              auth, books, borrows, ratings, profile, recommendations, admin
    recommend/           item-item CF + popularity fallback
    scripts/seed.js      sample books, ML catalog import, admin user
    ml/
      data/raw/          Book-Crossing and Themes CSVs
      data/processed/    cleaned tables and library_catalog.csv
      notebooks/         recommendation_model.ipynb
      artifacts/         item_similarity.npz, isbn_index.json, item_neighbors.json
    server.js
  frontend/
    src/pages/           student and admin screens
    src/components/      layout, recommendation cards, covers
```

## How to run

### Requirements

- Node.js
- A MongoDB database named **`smart_library`** (the seed script refuses any other database name)

### Install

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment

Copy `backend/.env.example` to `backend/.env` and set:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_library?retryWrites=true&w=majority
JWT_SECRET=change-this-secret
```

Do not commit `.env`. Do not put real passwords in this README.

On a successful API start you should see `MongoDB connected: smart_library`.

### Seed sample data

```bash
cd backend
npm run seed
```

This upserts the original sample books, imports the ISBN catalog from `backend/ml/data/processed/library_catalog.csv`, and creates the librarian account if it is missing.

### Start the servers

Terminal 1 — API (`npm start` runs without file watching):

```bash
cd backend
npm run dev
```

API: http://localhost:5000

Terminal 2 — website:

```bash
cd frontend
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` to port 5000. Keep both processes running.

From the project root you can also use `npm run dev:backend` and `npm run dev:frontend`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Librarian / Admin | `admin@library.test` | `admin123` |

There is no seeded student account. Register a student, then borrow or rate a catalog book that has an ISBN so item–item recommendations can run. Without that history, For You still shows popularity fallback.

## Limitations

- The application catalog is relatively small.
- Books without ISBN cannot participate directly in item–item CF.
- Cold-start students receive the popularity fallback.
- Book-Crossing users are not the application’s MongoDB users.
- Recommendation quality depends on available interaction history.
- Content metadata covers only part of the modeling catalog.
