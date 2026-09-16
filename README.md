# 🎓 College Projects

> A collection of academic, software engineering, mobile development, web development, and machine learning projects built during my BSc IT journey.

This repository contains multiple college projects covering **full-stack web development, Android development, machine learning, database systems, progressive web apps, and software architecture**.

Each project is maintained as an independent application with its own technology stack, architecture, setup instructions, and documentation.

---

## 📌 Project Portfolio

| #  | Project                           | Domain                    | Core Technologies                            |
| -- | --------------------------------- | ------------------------- | -------------------------------------------- |
| 01 | 📚 **Smart Library**              | Recommendation System     | React · Node.js · Express · MongoDB          |
| 02 | ⏳ **AgeLens**                     | Android / Utility         | Kotlin · Jetpack Compose · Express · MongoDB |
| 03 | 🧠 **IRA**                        | Machine Learning          | Python · Scikit-learn · React · Node.js      |
| 04 | 💊 **Pharmacy Management System** | .NET / Database           | C# · .NET 8 · ASP.NET Core · SQL Server      |
| 05 | 📋 **Taskzen**                    | Productivity / Full Stack | React · Redux · Node.js · Express · MongoDB  |

---

# 🗂️ Projects

## 📚 01 — Smart Library Book Recommendation System

A college library web application that allows students to **browse, borrow, return, rate, and discover books** through a simple explainable recommendation system.

Unlike ML-based recommendation engines, Smart Library uses a **deterministic weighted scoring algorithm**, making every recommendation easy to explain during a presentation or viva.

### ✨ Highlights

* Student registration and authentication
* Department, year, and interest preferences
* Book search and genre filtering
* Book details and ratings
* Borrowing and return management
* Borrowing history
* Personalized **Home** and **For You** recommendations
* Librarian/admin dashboard
* Book management
* Borrowing records and statistics
* Most-borrowed books and popular genres
* 14-day overdue detection

### 🧠 Recommendation Engine

Each candidate book receives a score between **0 and 1**.

| Signal                       | Weight |
| ---------------------------- | -----: |
| Interest / Genre Match       |    40% |
| Similarity to Borrowed Books |    30% |
| Book Rating                  |    30% |

Books already borrowed by the student are excluded.

The system also generates an explainable reason such as:

> “Recommended because it matches your interest in AI and is similar to books you previously borrowed.”

The scoring implementation is located in:

```text
backend/recommend/recommend.js
```

### 🛠️ Stack

**Frontend**

* React
* Vite
* Tailwind CSS

**Backend**

* Node.js
* Express

**Database**

* MongoDB Atlas
* Mongoose

**Authentication**

* JWT
* Password hashing

### 🏗️ Architecture

```text
React + Vite
     │
     │ REST API
     ▼
Node.js + Express
     │
     │ Mongoose
     ▼
MongoDB Atlas
     │
     ▼
Recommendation Engine
```

### 🎯 Project Focus

> **Explainable recommendations without Machine Learning or LLMs.**

---

# ⏳ 02 — AgeLens

A lightweight Android application that calculates detailed age information and visualizes a person's lifetime in weeks.

AgeLens combines a **Kotlin + Jetpack Compose Android application** with a small **Express + MongoDB backend** for calculation history.

### ✨ Features

#### 🧮 Age Calculator

* Years, months and days
* Days lived
* Weeks lived
* Next birthday
* Days until next birthday
* Age on next birthday

#### 🟦 Life in Weeks

A visual grid where:

```text
1 square = 1 week
1 row    = 1 year
```

Supports:

* 80-year view
* 90-year view
* 100-year view
* Past / current / future weeks
* Approximate date for individual weeks
* Age associated with a selected week

#### ⚖️ Age Difference

Compare two dates of birth and calculate:

* Who is older
* Years / months / days difference
* Total days difference
* Identical DOB handling

#### 📅 Historical Age

Calculate age on any valid past or future date.

#### 🗃️ History

Calculations can be:

* Saved
* Retrieved
* Deleted

### 🧠 Date Calculation

Age calculations use Java's calendar-aware APIs:

```text
java.time
├── Period.between()
└── ChronoUnit
```

The project intentionally avoids simplistic calculations such as:

```text
days / 365
```

This allows the application to correctly handle:

* Leap years
* Different month lengths
* February 29
* Exact birthdays

### 🛠️ Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Android    | Kotlin             |
| UI         | Jetpack Compose    |
| Design     | Material 3         |
| Navigation | Navigation Compose |
| Networking | Retrofit           |
| Date Math  | java.time          |
| Backend    | Node.js + Express  |
| Database   | MongoDB            |
| ODM        | Mongoose           |

### 🏗️ Architecture

```text
Android App
(Kotlin + Compose)
       │
       │ REST / Retrofit
       ▼
Express API
       │
       │ Mongoose
       ▼
MongoDB
```

### 📱 Project Structure

```text
Age_calculator/
│
├── app/
│   └── src/main/java/com/agelens/app/
│       ├── calculator/
│       ├── data/
│       ├── model/
│       ├── navigation/
│       ├── screens/
│       ├── ui/
│       └── MainActivity.kt
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env.example
│
└── releases/
    └── AgeLens.apk
```

### 🎯 Project Focus

> **Calendar-correct age calculation + mobile UI + REST-based persistence.**

---

# 🧠 03 — IRA — Student Dropout Risk Intelligence

IRA is a machine-learning project designed to analyze student information and predict:

1. **Dropout risk**
2. **Academic performance**

The project demonstrates an end-to-end ML pipeline connected to multiple React dashboards through a Node.js API.

### 🔍 Prediction Tasks

#### Classification

Predicts:

```text
Low Risk
Medium Risk
High Risk
```

Features include:

* Attendance
* Current test score
* Current assignment score
* Previous test score
* Previous assignment score
* Fees
* Gender

Candidate models:

* Logistic Regression
* Decision Tree
* Random Forest
* HistGradientBoosting

Model selection uses:

```text
F1-macro
```

with a stratified 80/20 split and:

```text
random_state = 42
```

#### Regression

Predicts academic performance.

The target is:

```text
mean(current test, current assignment)
```

Current scores are excluded from the regression features to avoid leakage.

Candidate models:

* Linear Regression
* Ridge
* Decision Tree
* Random Forest
* HistGradientBoosting

Model selection uses:

```text
R²
```

Additional metrics:

* MAE
* MSE
* RMSE

### ⚙️ ML Pipeline

```text
Raw CSV
   │
   ▼
Preprocessing
   │
   ├── Median / Mode Imputation
   ├── RobustScaler
   └── OneHotEncoder
   │
   ▼
Model Training
   │
   ▼
Model Comparison
   │
   ▼
Selected Pipeline
   │
   ▼
.joblib Artifacts
   │
   ▼
Python Inference
   │
   ▼
Node.js API
   │
   ▼
React Dashboards
```

Training is **not performed for every API request**.

Saved pipelines are used for inference.

### 📊 Dashboards

IRA contains three separate React dashboards:

| Dashboard | Port | Style / Purpose           |
| --------- | ---: | ------------------------- |
| Mayuresh  | 5173 | Operations / risk command |
| Deepu     | 5174 | Student advising          |
| Amir      | 5175 | Analytics / insights      |

All three communicate with the same backend API.

### 🛠️ Stack

**Machine Learning**

* Python
* Pandas
* NumPy
* Scikit-learn
* Joblib

**Backend**

* Node.js
* Express

**Frontend**

* React

### 🏗️ Architecture

```text
React Dashboard
      │
      │ GET / POST
      ▼
Node.js + Express
      │
      │ spawn Python
      ▼
ml/infer.py
      │
      ▼
Saved sklearn Pipelines
      │
      ▼
Prediction + Analytics
```

### 📡 Main API

```text
GET  /health
GET  /metadata
GET  /model-info
GET  /analytics
POST /predict
```

### 🎯 Project Focus

> **End-to-end machine learning inference through a web-based dashboard.**

---

# 💊 04 — Pharmacy Management System

A multi-phase pharmacy management project developed in **C# / .NET 8**.

The project is intentionally divided into **three independently runnable phases**, demonstrating the progression from a basic OOP console application to a database-backed web application and finally an installable PWA.

```text
Phase 1 → Console OOP
Phase 2 → ASP.NET Core MVC + SQL Server
Phase 3 → Progressive Web App
```

The phases share the same pharmacy domain but are **not one connected runtime system**.

### 🧩 Phase Overview

| Phase | Application        | Purpose                    | Data              |
| ----- | ------------------ | -------------------------- | ----------------- |
| 1     | ConsoleApplication | OOP + business logic       | In-memory         |
| 2     | ASPNETApplication  | Full web application       | SQL Server        |
| 3     | PWA                | Installable/offline client | Browser demo data |

### 🧪 Phase 1 — Console Application

A menu-driven pharmacy application demonstrating object-oriented programming and business rules.

Features include:

* Medicine management
* Supplier management
* Customer management
* Purchases
* Sales
* Stock tracking
* Low-stock reports
* Expiry reports
* Purchase reports
* Sales reports
* Input validation

Core business rules:

```text
New medicine → Stock = 0

Purchase → Stock increases

Sale → Stock decreases

Sale > Available Stock → Rejected

Expired Medicine → Cannot be sold
```

Data exists only during the current process.

### 🌐 Phase 2 — ASP.NET Core MVC

The full database-backed pharmacy system.

Features:

* Authentication
* Medicines CRUD
* Suppliers CRUD
* Customers CRUD
* Purchases
* Sales
* Stock management
* Dashboard
* Inventory reports
* Low-stock reports
* Expiry reports
* Sales reports
* Purchase reports
* Password management

### 🗄️ Database

```text
ASP.NET Core MVC
       │
       ▼
Entity Framework Core
       │
       ▼
SQL Server / LocalDB
```

Database:

```text
PharmacyManagementDb
```

### 📱 Phase 3 — PWA

An independently runnable Progressive Web App for quick pharmacy information and alerts.

Features:

* Installable application
* Responsive interface
* Medicine search
* Stock status
* Alerts
* Offline mode
* IndexedDB
* localStorage fallback
* Service Worker
* Local browser notifications

The PWA uses **demo data** and is not connected to the Phase 2 SQL Server database.

### 🛠️ Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Language | C#                       |
| Runtime  | .NET 8                   |
| Web      | ASP.NET Core MVC         |
| ORM      | Entity Framework Core    |
| Database | SQL Server / LocalDB     |
| PWA      | HTML · CSS · JavaScript  |
| Storage  | IndexedDB / localStorage |
| Offline  | Service Worker           |

### 🎯 Project Focus

> **Demonstrating the evolution of the same domain across OOP, database-backed web development, and PWA architecture.**

---

# 📋 05 — Taskzen

Taskzen is a full-stack **Kanban-style task and project management application** based around the workflow:

```text
Board → List → Card
```

It is designed for personal task management, academic projects, and lightweight team collaboration.

> Taskzen is an independent student/portfolio project and is not an official Trello product.

### ✨ Features

#### 🔐 Authentication

* User registration
* User login
* bcrypt password hashing
* JWT authentication
* Protected routes
* Logout
* Session restoration

#### 📌 Boards

* Create boards
* Rename boards
* Board descriptions
* Background images/colors
* Board members
* Activity history
* Board search

#### 📝 Lists

* Create lists
* Rename lists
* Delete lists
* Drag-and-drop ordering
* Persistent ordering

#### 🗃️ Cards

Cards support:

* Title
* Description
* Labels
* Members
* Start dates
* Due dates
* Completion status
* Checklists
* Comments
* Activity history
* Cover colors
* URL attachments

Cards and lists can be reorganized using drag and drop.

### 🏗️ Architecture

```text
React Client
     │
     │ Axios / JSON
     ▼
Express REST API
     │
     │ JWT Middleware
     ▼
Controllers / Services
     │
     ▼
Mongoose Models
     │
     ▼
MongoDB
```

### 🛠️ Stack

| Layer          | Technology          |
| -------------- | ------------------- |
| Frontend       | React 17            |
| Routing        | React Router DOM    |
| State          | Redux Toolkit       |
| HTTP           | Axios               |
| Drag & Drop    | react-beautiful-dnd |
| Styling        | styled-components   |
| UI             | Material UI         |
| Backend        | Node.js + Express   |
| Authentication | JWT + bcrypt        |
| Database       | MongoDB + Mongoose  |
| Build          | Create React App    |

### ⚠️ Current Scope

The current implementation does **not** include:

* WebSocket-based real-time collaboration
* Board deletion
* Actual file uploads
* Email/push notifications
* Production deployment configuration
* Automated application tests
* Full production authentication hardening

Attachments are stored as **URL links**, and collaboration happens through shared database state rather than live synchronized editing.

### 🎯 Project Focus

> **Full-stack MERN application with authentication, persistent Kanban boards, drag-and-drop interaction, and structured REST APIs.**

---

# 🧰 Technology Coverage

Across these projects, the portfolio covers several areas of software development.

```text
                    COLLEGE PROJECTS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
      WEB                MOBILE              ML
        │                  │                  │
   React / Node        Kotlin / Compose    Python / sklearn
   Express / Mongo     Retrofit            Pandas / NumPy
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                     DATABASES
                           │
              MongoDB / SQL Server
                           │
                    .NET / PWA
                           │
                  C# / ASP.NET / JS
```

### Languages

```text
JavaScript
Python
Kotlin
C#
HTML
CSS
SQL
```

### Frameworks & Libraries

```text
React
Node.js
Express
ASP.NET Core
Jetpack Compose
Entity Framework Core
Scikit-learn
Mongoose
Redux Toolkit
Tailwind CSS
Material UI
```

### Databases

```text
MongoDB
MongoDB Atlas
SQL Server
LocalDB
IndexedDB
```

### Development Concepts

```text
REST APIs
JWT Authentication
OOP
MVC
CRUD
Database Persistence
Machine Learning
Model Pipelines
Responsive UI
PWA
Offline Storage
Drag & Drop
Unit Testing
```

---

# 📁 Repository Organization

The parent folder is organized by project:

```text
College Projects/
│
├── 📚 Smart Library/
│   ├── frontend/
│   ├── backend/
│   └── README.md
│
├── ⏳ Age_calculator/
│   ├── app/
│   ├── backend/
│   ├── releases/
│   └── README.md
│
├── 🧠 IRA/
│   ├── frontend/
│   │   ├── mayuresh/
│   │   ├── deepu/
│   │   └── amir/
│   ├── backend/
│   ├── ml/
│   ├── requirements.txt
│   └── README.md
│
├── 💊 PharmacyManagement/
│   ├── ConsoleApplication/
│   ├── ASPNETApplication/
│   ├── PWA/
│   ├── Database/
│   ├── Documentation/
│   └── README.md
│
├── 📋 Taskzen/
│   ├── client/
│   ├── server/
│   └── README.md
│
└── README.md
```

---

# 🔐 Security & Configuration

Projects that require credentials or connection strings use environment configuration rather than committing secrets directly into the repository.

Typical environment variables include:

```text
MONGO_URI
MONGODB_URI
JWT_SECRET
TOKEN_EXPIRE_TIME
PORT
PYTHON_BIN
FRONTEND_ORIGINS
```

### Never commit

```text
.env
database passwords
API keys
JWT secrets
private credentials
```

Use the project's `.env.example` files as templates.

---

# 🎓 Academic Purpose

These projects were developed as part of college coursework, practical assignments, experimentation, and portfolio development.

The projects collectively demonstrate:

* Requirements analysis
* Software architecture
* Frontend development
* Backend development
* Database design
* Authentication
* API development
* Object-oriented programming
* Machine learning
* Mobile development
* Testing
* Documentation
* Deployment-oriented thinking

The implementations intentionally remain understandable enough to **explain the architecture and code during a college viva or presentation**.

---

# 📚 Project Documentation

Each project contains its own README with detailed information about:

* Features
* Architecture
* Project structure
* Setup
* Environment variables
* Database configuration
* APIs
* Testing
* Demo workflows
* Known limitations

Start with the project-specific README before running an application.

---

# ⚠️ General Notes

These are primarily **academic / development projects**, not production-ready commercial systems.

Depending on the project, limitations may include:

* Local development URLs
* Development authentication
* Local databases
* Demo/sample data
* Missing production deployment configuration
* Limited automated testing
* Development-only secrets/configuration
* Third-party assets or APIs

Do not assume that a feature exists simply because it would normally be expected in a production application. The individual project README is the source of truth for the implemented scope.

---

# 🚀 Portfolio Snapshot

| Project                | Main Concept                | Key Learning                      |
| ---------------------- | --------------------------- | --------------------------------- |
| 📚 Smart Library       | Explainable recommendations | Full-stack + recommendation logic |
| ⏳ AgeLens              | Age & life visualization    | Android + REST API                |
| 🧠 IRA                 | Dropout prediction          | ML + model serving                |
| 💊 Pharmacy Management | Pharmacy operations         | C# / .NET + SQL + PWA             |
| 📋 Taskzen             | Kanban productivity         | MERN + authentication + drag/drop |

---

## 💡 Built to Learn. Built to Explain. Built to Ship.

These projects represent different stages of learning across **software engineering, web development, mobile development, databases, machine learning, and application architecture**.

```text
Learn → Build → Test → Document → Present → Improve
```

**© College Projects — Academic / Portfolio Collection**
