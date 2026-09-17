# Smart Expense Tracker

Full-stack expense management app: user auth, expense/income tracking, category management, and monthly analytics with charts.

**Stack:** React + TypeScript (Vite) · FastAPI · SQLAlchemy · PostgreSQL (SQLite for local dev) · JWT auth · Recharts

Tested end-to-end locally (register → login → add transactions → categories → analytics charts) with zero console errors before you got this.

## Project structure

```
smart-expense-tracker/
├── backend/          FastAPI app
│   ├── app/
│   │   ├── main.py         FastAPI app + CORS + router registration
│   │   ├── models.py       SQLAlchemy models: User, Category, Transaction
│   │   ├── schemas.py      Pydantic request/response schemas
│   │   ├── auth.py         JWT auth, password hashing
│   │   ├── database.py     DB engine/session (SQLite locally, Postgres in prod)
│   │   └── routers/        auth, categories, transactions, analytics
│   ├── requirements.txt
│   └── render.yaml         one-click Render deploy blueprint
└── frontend/         React + TypeScript (Vite)
    ├── src/
    │   ├── pages/           Login, Register, Dashboard, Transactions, Categories
    │   ├── context/         AuthContext (JWT stored in localStorage)
    │   ├── api/              axios client + typed endpoint calls
    │   └── components/      Layout, ProtectedRoute
    └── vercel.json
```

## Run it locally right now

**Backend** (needs Python 3.11+):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Uses SQLite automatically — no database setup needed. API docs at http://localhost:8000/docs.

**Frontend** (needs Node 18+):
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 — register an account and you're in. New accounts get 10 default categories pre-seeded.

## Deploying it live (free, ~15 minutes, no credit card)

### 1. Push to GitHub
```bash
cd smart-expense-tracker
git init
git add .
git commit -m "Smart Expense Tracker"
```
Create a new repo on GitHub (github.com/new), then:
```bash
git remote add origin https://github.com/<your-username>/smart-expense-tracker.git
git branch -M main
git push -u origin main
```

### 2. Deploy the backend on Render
1. Go to https://render.com → sign up/log in with GitHub.
2. Click **New +** → **Blueprint**, pick your repo. Render will detect `backend/render.yaml` and set up both the web service and a free PostgreSQL database automatically.
3. Deploy. Once live, copy the backend URL (something like `https://expense-tracker-api.onrender.com`).

*(If Blueprint isn't available on your account: New + → Web Service → pick the repo → set root directory to `backend` → build command `pip install -r requirements.txt` → start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Add a free PostgreSQL instance separately and set `DATABASE_URL` and `SECRET_KEY` env vars on the web service.)*

### 3. Deploy the frontend on Vercel
1. Go to https://vercel.com → sign up/log in with GitHub.
2. **Add New** → **Project** → import the same repo, set root directory to `frontend`.
3. Add environment variable `VITE_API_URL` = your Render backend URL from step 2.
4. Deploy. You'll get a live URL like `https://smart-expense-tracker.vercel.app`.

### 4. Connect them
Back in Render, set the backend's `CORS_ORIGINS` env var to your Vercel URL (instead of `*`) and redeploy, so only your frontend can call the API.

You now have a live, working, deployed full-stack app to demo tomorrow.

## What each feature demonstrates (for interview talking points)

- **JWT auth** (`app/auth.py`) — password hashing with bcrypt, stateless token auth, `OAuth2PasswordBearer` + `Depends` for protected routes.
- **RESTful API design** (`app/routers/`) — resource-based routes, proper status codes (201 on create, 204 on delete, 401/404 handling), Pydantic schemas separating input/output shapes from DB models.
- **Relational schema** (`app/models.py`) — `User` 1→many `Category`/`Transaction`, `Category` 1→many `Transaction`, cascade deletes, enum-typed `TransactionType`.
- **Analytics endpoint** (`app/routers/analytics.py`) — server-side aggregation (category breakdown, monthly trend) rather than shipping raw rows to the client — the kind of tradeoff interviewers like to probe ("why not just query all transactions and sum in the frontend?" → less data over the wire, single source of truth for business logic, easier to cache/scale later).
- **React architecture** (`src/`) — context for auth state, protected routes via a wrapper component, typed API layer separate from components, controlled forms.
- **Charts** (`src/pages/Dashboard.tsx`) — Recharts PieChart for category breakdown, BarChart for income/expense trend, both driven by the single `/api/analytics/summary` response.

## Local dev note

`DATABASE_URL` is unset locally, so `backend/app/config.py` falls back to SQLite (`expense_tracker.db`, gitignored). In production, Render injects a PostgreSQL `DATABASE_URL` automatically via `render.yaml` — same code path, `psycopg2-binary` handles the Postgres connection, no code changes needed between environments.
