# AgeLens

A simple college-level Android app that calculates age details and visualizes life in weeks.  
Android talks to a small Express + MongoDB API to save, view, and delete calculation history.

**Architecture:** `Android → REST API → Express → MongoDB`

---

## Features

1. **Home / Age Calculator**  
   Optional name + date of birth → years/months/days, days lived, weeks lived, next birthday, days until next birthday, age on next birthday.

2. **Life in Weeks**  
   Grid where 1 square = 1 week and 1 row = 1 year. Past / current / future weeks, 80/90/100-year views, tap a week for approximate date and age.

3. **Age Difference**  
   Compare two DOBs → who is older, difference in years/months/days and total days (handles identical DOBs).

4. **Historical Age**  
   Age on any past or future date (rejects dates before DOB).

5. **History**  
   Save calculations to MongoDB; list and delete them from the app.

Age math uses `java.time` (`Period.between`, `ChronoUnit`) — **not** `days / 365`. Leap years and Feb 29 are handled.

---

## Project structure

```text
Age_calculator/
├── app/                          # Android (Kotlin + Jetpack Compose)
│   └── src/main/java/com/agelens/app/
│       ├── calculator/           # Age & life-weeks math (no UI)
│       ├── data/                 # Retrofit API client
│       ├── model/                # Data classes
│       ├── navigation/           # Bottom nav + routes
│       ├── screens/              # Home, Life, Tools, History, …
│       ├── ui/                   # Theme + shared components
│       └── MainActivity.kt
├── backend/                      # Node.js + Express + Mongoose
│   ├── models/Calculation.js
│   ├── routes/calculations.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── releases/AgeLens.apk          # Built release APK (local)
```

---

## Tech stack

| Layer   | Tech |
|--------|------|
| Android | Kotlin, Jetpack Compose, Material 3, Navigation Compose, Retrofit, `java.time` |
| Backend | Node.js, Express, MongoDB, Mongoose, dotenv, cors |

The MongoDB URI stays in the backend `.env` only — never inside the Android app.

---

## Backend setup

### 1. Prerequisites
- Node.js
- MongoDB running locally, **or** a MongoDB Atlas connection string

### 2. Configure env

```bash
cd backend
copy .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/agelens
PORT=5000
```

For Atlas, paste your cluster URI into `MONGODB_URI`.

### 3. Install & run

```bash
cd backend
npm install
npm start
```

API base: `http://localhost:5000`

### API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/calculations` | Save a calculation |
| `GET` | `/api/calculations` | List saved calculations |
| `DELETE` | `/api/calculations/:id` | Delete one |

Example save body:

```json
{
  "name": "Alex",
  "birthDate": "2000-05-10",
  "calculationType": "age",
  "result": {
    "years": 26,
    "months": 0,
    "days": 0
  }
}
```

---

## Android setup

### 1. Open the project
Open the repo root in **Android Studio**, sync Gradle, then run on an emulator or device (`minSdk 26`).

### 2. Point the app at your backend

In `app/src/main/java/com/agelens/app/data/ApiClient.kt`:

| Where you run the app | `BASE_URL` |
|----------------------|------------|
| Android Emulator | `http://10.0.2.2:5000/` (default) |
| Physical phone | `http://YOUR_PC_LAN_IP:5000/` (same Wi‑Fi) |

`10.0.2.2` is the emulator’s alias for the host PC’s `localhost`.

### 3. Build APK (optional)

```bash
gradlew.bat assembleRelease
```

Output:

- `app/build/outputs/apk/release/app-release.apk`
- Copy also available at `releases/AgeLens.apk` after a Phase 7 build

---

## How to demo (quick)

1. Start MongoDB and `npm start` in `backend/`.
2. Run AgeLens on an emulator.
3. **Home** → pick DOB → Calculate → optionally **Save to History**.
4. **Life** → pick DOB → Show Life Grid → tap a square.
5. **Tools** → Age Difference / Historical Age.
6. **History** → Refresh / Delete saved items.

---

## Validation & errors

The app handles:

- Empty DOB  
- Future DOB  
- Historical date before DOB  
- Identical DOBs (same age)  
- Backend/network failure (simple messages, no crash)

---

## Unit tests

Calculator tests (good for viva):

```bash
gradlew.bat test
```

Covers exact birthday age, future DOB rejection, Feb 29 → Feb 28 in non-leap years, age difference, and historical age.

---

## Viva notes (short)

- **Why Compose?** Declarative UI; screens are composable functions.
- **Why separate `calculator/`?** Keeps math testable and easy to explain without UI code.
- **Why `Period.between`?** Calendar-correct years/months/days (leap years, month lengths).
- **Why backend?** History is stored in MongoDB through Express REST; the app never holds the DB URI.
- **Life in Weeks:** Canvas grid for performance (thousands of squares without thousands of composables).

---

## License / academic use

Built as a college project (AgeLens). Keep the code simple enough to explain end-to-end in a viva.
