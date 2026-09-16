# Taskzen

Taskzen is a full-stack task and project management application. It uses a **board → list → card** workflow so individuals and small teams can organize work visually.

The product is inspired by the Kanban-style layout used in many productivity tools. It is an independent student/portfolio project, **not** an official Trello product.

---

## Overview

Taskzen helps users keep work visible instead of scattered across notes, chats, and spreadsheets.

After signing in, a user lands on a dashboard of their boards. Each board is a workspace with a background, members, description, and activity history. Lists act as columns (for example, To Do / Doing / Done). Cards represent tasks and can hold details such as description, labels, members, dates, checklists, attachments (as links), cover color, and comments.

**Intended use cases**

- Personal task tracking
- Academic or group project planning
- Lightweight team boards where members are invited by email
- Organizing work stages with drag-and-drop columns and cards

This repository is structured as a local MERN application (MongoDB, Express, React, Node.js). The frontend talks to a REST API on `http://localhost:5000`. There is no built-in production deployment pipeline in this repo.

---

## Features

Only features that exist in the current codebase are listed below.

### Authentication

- User registration with name, surname, email, password, and password confirmation
- User login with email and password
- Passwords hashed with bcrypt on the server
- JWT issued after login and stored in `localStorage`
- Protected routes for boards (`/boards`, `/board/:id`)
- Public routes for landing, login, and register (logged-in users are redirected to `/boards`)
- Logout from the navbar profile menu
- Snackbar alerts for success and error messages

### Boards

- View all boards belonging to the current user
- Create a board with a title and Unsplash background
- Open a board by ID
- Rename a board from the board top bar
- Add a board description from **Show menu → About this board**
- Change board background (photos via an Unsplash proxy request, or solid colors)
- Invite existing users to a board by email
- View board members
- View board activity history in the board menu
- Client-side search that filters board titles on the dashboard

### Lists (columns)

- Create lists on a board
- Rename a list
- Delete a list
- Drag lists horizontally to reorder them
- Order changes are persisted through the API

### Cards (tasks)

- Create cards in a list
- Open a card modal to edit details
- Update card title and description
- Delete a card
- Drag cards within a list or between lists
- Cover color for a card
- Labels (create, edit, delete, select)
- Assign or remove card members (from board members)
- Start date, due date, due time, and a completed flag
- Multiple checklists with items, completion toggles, and item text edits
- Attachments stored as **URL links** (not file uploads)
- Comments on cards (add, edit, delete)
- Card activity log
- Client-side search that filters card titles on the open board

### Other UI

- Landing page with sign up / log in
- Responsive layout breakpoints for smaller screens
- Loading overlay while boards or lists are fetching
- Navbar with board dropdown, search, and profile avatar

### Not implemented (do not assume)

- Real-time collaboration (no WebSockets)
- Board deletion
- File upload for attachments
- Email notifications or push notifications
- Card “watch” UI (the data model has a `watchers` field, but the Watch action is commented out)
- Automated tests (CRA test scripts exist; there are no project test files)
- Cloud hosting, CI/CD, or production auth hardening beyond JWT + bcrypt as implemented

---

## Application Workflow

```text
Landing page
    ↓
Register or log in
    ↓
Boards dashboard
    ↓
Create or open a board
    ↓
Create lists (columns)
    ↓
Create cards (tasks)
    ↓
Edit card details / drag to organize
    ↓
Invite members (optional)
```

1. Visit `/` and sign up or log in.
2. The app stores a JWT and loads `/boards`.
3. Create a board or open an existing one (`/board/:id`).
4. Add lists, then add cards to those lists.
5. Drag lists or cards to change order.
6. Open a card to add description, labels, dates, checklists, members, link attachments, and comments.
7. Use **Add Member** to invite another registered user by email.
8. Use **Show menu** for board description, background, and activity.

---

## Tech Stack

| Layer | Technology | Purpose |
|------|------------|---------|
| Frontend | React 17 | SPA UI |
| Routing | React Router DOM 5 | Pages and route guards |
| State | Redux Toolkit + React Redux | Auth, boards, lists, cards, alerts |
| HTTP client | Axios | REST calls; Authorization bearer token |
| Drag and drop | react-beautiful-dnd | List and card reordering |
| Styling | styled-components | Component styles and breakpoints |
| UI kit | MUI (Material UI) 5 | Modals, menus, avatars, snackbars, icons |
| CSS reset | @atlaskit/css-reset | Base element reset |
| Dates | moment, react-date-range | Card dates and activity timestamps |
| Frontend build | Create React App (`react-scripts`) | Dev server and production build |
| Backend | Node.js + Express | REST API |
| Auth middleware | jsonwebtoken, express-unless | JWT on all routes except login/register |
| Password hashing | bcryptjs | Store hashed passwords |
| Database | MongoDB via Mongoose | Users, boards, lists, cards |
| Config | dotenv | `PORT`, `MONGO_URI`, `JWT_SECRET`, `TOKEN_EXPIRE_TIME` |
| CORS | cors | Allow browser requests to the API |
| Dev (server) | nodemon | Restart API on file changes |
| Package manager | npm | Client and server dependencies |

Emotion is present because MUI depends on it. `@date-io/date-fns`, `date-fns`, and `@react-hook/mouse-position` are installed but not imported in application source.

---

## Project Architecture

```text
Browser (React client, port 3000)
        │  Axios REST (JSON)
        ▼
Express API (port 5000)
        │  JWT middleware (except /user/login, /user/register)
        ▼
Controllers → Services → Mongoose models
        │
        ▼
MongoDB
```

- **Frontend** (`client/`): React pages, Redux slices, and service modules that call hardcoded `http://localhost:5000` URLs.
- **Backend** (`server/`): Express mounts `/user`, `/board`, `/list`, and `/card`.
- **Authentication**: JWT in the `Authorization: Bearer <token>` header. The token is created on login and restored from `localStorage` on app load.
- **Persistence**: MongoDB collections for `user`, `board`, `list`, and `card` (Mongoose model names).

There is no GraphQL layer, no message queue, and no separate real-time server.

---

## Project Structure

```text
trello-mern-master/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.js                 # Routes
│   │   ├── index.js               # React + Redux entry
│   │   ├── Components/            # Pages, navbar, modals, drawers
│   │   ├── Redux/                 # Store and slices
│   │   ├── Services/              # Axios API wrappers
│   │   ├── Utils/                 # Protected/free routes, bearer helper
│   │   └── Images/
│   └── package.json
├── server/
│   ├── server.js                  # Express app, Mongo connection
│   ├── Controllers/
│   ├── Routes/
│   ├── Services/
│   ├── Models/
│   ├── Middlewares/auth.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## Frontend Routes

| Path | Access | Screen |
|------|--------|--------|
| `/` | Public | Landing |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/boards` | Authenticated | Board dashboard |
| `/board/:id` | Authenticated | Single board |

---

## API Overview

Base URL used by the client: `http://localhost:5000`

Unless noted, endpoints require a valid JWT.

### User (`/user`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/user/register` | No | Create user |
| POST | `/user/login` | No | Login and receive JWT |
| GET | `/user/get-user` | Yes | Current user |
| POST | `/user/get-user-with-email` | Yes | Look up a user by email (for invites) |

### Board (`/board`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/board/create` | Create board |
| GET | `/board/` | List current user’s boards |
| GET | `/board/:id` | Get board by id |
| GET | `/board/:id/activity` | Board activity |
| PUT | `/board/:boardId/update-board-title` | Rename board |
| PUT | `/board/:boardId/update-board-description` | Update description |
| PUT | `/board/:boardId/update-background` | Update background |
| POST | `/board/:boardId/add-member` | Add members |

### List (`/list`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/list/create` | Create list |
| GET | `/list/:id` | Lists for a board (`id` is board id) |
| PUT | `/list/:boardId/:listId/update-title` | Rename list |
| DELETE | `/list/:boardId/:listId` | Delete list |
| POST | `/list/change-card-order` | Persist card drag order |
| POST | `/list/change-list-order` | Persist list drag order |

### Card (`/card`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/card/create` | Create card |
| GET | `/card/:boardId/:listId/:cardId` | Get card |
| PUT | `/card/:boardId/:listId/:cardId` | Update title/description |
| DELETE | `/card/:boardId/:listId/:cardId/delete-card` | Delete card |
| POST | `/card/.../add-comment` | Add comment |
| PUT | `/card/.../:commentId` | Edit comment |
| DELETE | `/card/.../:commentId` | Delete comment |
| POST | `/card/.../add-member` | Add card member |
| DELETE | `/card/.../:memberId/delete-member` | Remove card member |
| POST | `/card/.../create-label` | Create label |
| PUT | `/card/.../:labelId/update-label` | Update label |
| PUT | `/card/.../:labelId/update-label-selection` | Toggle label |
| DELETE | `/card/.../:labelId/delete-label` | Delete label |
| POST | `/card/.../create-checklist` | Create checklist |
| DELETE | `/card/.../:checklistId/delete-checklist` | Delete checklist |
| POST | `/card/.../:checklistId/add-checklist-item` | Add item |
| PUT | `/card/.../set-checklist-item-text` | Edit item text |
| PUT | `/card/.../set-checklist-item-completed` | Toggle item |
| DELETE | `/card/.../delete-checklist-item` | Delete item |
| PUT | `/card/.../update-dates` | Start/due dates |
| PUT | `/card/.../update-date-completed` | Due complete flag |
| POST | `/card/.../add-attachment` | Add link |
| PUT | `/card/.../:attachmentId/update-attachment` | Edit link |
| DELETE | `/card/.../:attachmentId/delete-attachment` | Remove link |
| PUT | `/card/.../update-cover` | Cover color |

---

## Data Models (simplified)

**User:** name, surname, email, hashed password, optional avatar/color, list of board IDs.

**Board:** title, background (image URL or color), `isImage`, description, members (with role), lists, activity entries, timestamps.

**List:** title, ordered card IDs, owner board.

**Card:** title, description, labels, members, optional watchers field, dates, attachments, activities/comments, cover, checklists, owner list.

---

## Environment Variables

Create `server/.env` from `server/.env.example`:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (client expects **5000**) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `TOKEN_EXPIRE_TIME` | JWT lifetime (for example `7d`) |

Do not commit real secrets. `.env` is gitignored.

The React client does **not** use `REACT_APP_*` variables. API hosts are hardcoded in `client/src/Services/`.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (includes npm)
- MongoDB locally, or a MongoDB Atlas cluster

### Setup

```bash
# Server
cd server
npm install
copy .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm start
```

```bash
# Client (second terminal)
cd client
npm install
npm start
```

The Create React App dev server typically opens at `http://localhost:3000`. The API must be running on port `5000` or login/board requests will fail.

On Linux/macOS use `cp .env.example .env` instead of `copy`.

This client uses `react-scripts` 4. On Node.js 17+, webpack may fail with `ERR_OSSL_EVP_UNSUPPORTED`. If that happens, start the client with the OpenSSL legacy provider, for example in PowerShell:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm start
```

---

## Available Scripts

**`server/`**

| Script | Command | Description |
|--------|---------|-------------|
| Start API | `npm start` | Runs `nodemon server.js` |

**`client/`**

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm start` | CRA development server |
| Production build | `npm run build` | Output in `client/build` |
| Tests | `npm test` | CRA test runner (no app tests added) |
| Eject | `npm eject` | Eject CRA config (irreversible) |

---

## Notes and Limitations

- This is a **development-oriented** project. It does not include production deployment configs, HTTPS setup, or rate limiting.
- CORS is enabled globally with the `cors` package.
- Background photo picking calls `https://trello.com/proxy/unsplash/...` and some thumbnail assets on `a.trellocdn.com`. Those are existing third-party URLs used by the original UI, not Taskzen branding.
- Search is **local filtering** of titles already loaded in the client, not a server search engine.
- Collaboration is **multi-user via the database**, not live simultaneous editing.

---

## Credits

Taskzen is a rebrand of an existing MERN board application originally published as a Trello-style clone by [Umur Dogan](https://github.com/umurdogann/trello-clone-mern). This repository updates the product name and documentation to Taskzen while keeping the original application behavior.

---

## License

The server package.json lists the ISC license. Confirm licensing with the original project if you redistribute this code.
