# AcaDiet — Codebase Guide

A full-stack web app that pulls **real dining-hall menus from Nutrislice** and builds
personalized meal plans against macro goals, plus a daily/monthly diet tracker.

> This file is loaded automatically each session. It's the map — skim the file index
> below to jump straight to the right file instead of searching.

## Stack
- **Frontend:** React 18 + TypeScript (Create React App), Tailwind CSS, Recharts. Dir: `frontend/`
- **Backend:** Node.js + Express, Prisma ORM + SQLite, JWT auth (bcryptjs). Dir: `backend/`
- **Planner:** deterministic macro-scoring (no AI/LLM). `backend/services/mealPlanner.js`

## Running it
- Start both dev servers: **`/start-server`** skill (frontend :3000, backend :3001).
- Stop them: **`/stop-server`** skill.
- After a Prisma schema change: `cd backend && npx prisma db push` (regenerates the client).
- Commit + push to GitHub: **`/push`** skill.

## Repo structure & file index

### Backend (`backend/`)
| File | Purpose |
|---|---|
| `server.js` | Express entry: helmet, CORS, morgan, rate-limit on auth routes, mounts `/api/auth` + `/api`, `/health`. |
| `auth.js` | `authMiddleware` (required) and `optionalAuth` — verify JWT `Authorization: Bearer`, set `req.userId`. |
| `routes/auth.js` | Auth + per-user data: register/login/me, goals, meal **history** (+ `/stats`, `/share`), **favorites** CRUD, daily **food log** CRUD + **monthly** aggregation. All `/log*` routes are recent. |
| `routes/api.js` | Menu + planning: university search, dining halls, `meal-plan/generate`, `meal-plan/swap`, public `share/:token`. |
| `services/nutrislice.js` | Nutrislice integration: `KNOWN_SCHOOLS`, **`resolveSubdomain`** (tries configured subdomain then `-housingdining`/`-dining`/`-housing` variants, caches winner), dining-hall list, single + multi-hall menu fetch, `parseMenuItems`. |
| `services/mealPlanner.js` | Deterministic plan logic: `filterByRestrictions`, `scoreItem` (favorite-aware ×1.25), `selectBestItems`, `generate`, `selectSwap`. |
| `prisma/schema.prisma` | Data models (below). SQLite. |

### Frontend (`frontend/src/`)
| File | Purpose |
|---|---|
| `App.tsx` | Root. `AuthProvider` + `AppContent`: 4-step wizard `step` state, `view` (`'plan'`/`'today'`) toggle, and all handlers — generate, regenerate, **swap item**, **add-to-today**, favorites, share, shared-plan loading. |
| `context/AuthContext.tsx` | Auth state + typed wrappers for every authed call (login/register/goals/history/favorites/**log**/**getMonthlyLog**/share). |
| `services/api.js` | Public API client: `searchUniversities`, `getDiningHalls`, `generateMealPlan`, **`swapMealItem`**, `getSharedPlan`. |
| `services/auth.js` | Authed API client (`authService`): all `/api/auth/*` calls incl. `addLog`/`getLog`/`getMonthlyLog`/`removeLog`. |
| `components/Header.jsx` | Top bar: logo, account menu (history/sign-out), **Plan/Today** toggle (logged-in only). |
| `components/StepIndicator.jsx` | Wizard progress bar. |
| `components/UniversitySearch.jsx` | Step 0 — pick school. |
| `components/GoalForm.jsx` | Step 1 — calorie/macro sliders + dietary restrictions. |
| `components/DiningHallSelect.jsx`, `MultiHallSelect.jsx` | Step 2 — per-meal hall selection. |
| `components/MealPlanDisplay.jsx` | Step 3 — renders the plan: meal sections, daily totals (`MacroBar`), per-item swap, **Add to Today**, share. |
| `components/FoodItem.jsx` | One food row: name, dietary badges, macros, **favorite** (♥) + **swap** (↻) buttons. |
| `components/MacroBar.jsx` | Horizontal macro progress bar (current/target, red on overflow). |
| `components/MacroRing.jsx` | Circular macro progress ring — same contract as `MacroBar`; used in Today/Month. |
| `components/MacroHistoryChart.jsx` | Recharts line chart of macro history; reused by the monthly view (`stats=[{date,calories,protein,carbs,fat}]`). |
| `components/DailyTracker.jsx` | **Today** tab: Day/Month toggle, macro rings, manual log form, quick-add favorites, today's entries; renders `MonthlyTracker`. |
| `components/MonthlyTracker.jsx` | **Month** view: calendar grid (per-day calories vs goal), macro trend chart, daily averages, month nav. |
| `components/MealHistoryPanel.jsx` | Saved meal-plan history modal. |
| `components/LoginModal.jsx`, `RegisterModal.jsx` | Auth modals. |
| `components/SharedPlanView.jsx` | Public read-only shared-plan page (`?share=TOKEN`). |
| `components/ErrorBoundary.tsx` | App-wide error boundary. |

## Data model (Prisma)
- **User** → `goals` (UserGoals 1:1), `history` (MealHistory[]), `favorites` (FavoriteFood[]), `foodLogs` (FoodLog[]).
- **UserGoals** — calories/protein/carbs/fat + `restrictions` (JSON string).
- **MealHistory** — a saved generated plan: `planJson`, totals, optional `shareToken`.
- **FavoriteFood** — `[userId, foodId]` unique; macros + dietary flags.
- **FoodLog** — daily logger: `date` (`YYYY-MM-DD`), name, macros. Indexed `[userId, date]`.

## Key API endpoints
- Public (`/api`): `GET universities/search`, `GET dining-halls`, `POST meal-plan/generate`, `POST meal-plan/swap`, `GET share/:token`.
- Auth (`/api/auth`, JWT): `register`, `login`, `me`, `PUT goals`, history (`POST`/`GET`/`GET /stats`/`POST /:id/share`), favorites (`GET`/`POST`/`DELETE /:foodId`), **log** (`POST`/`GET`/`DELETE /:id`/`GET /monthly`).

## Conventions & gotchas
- **The `school` param everywhere is the Nutrislice subdomain.** `KNOWN_SCHOOLS` subdomains are hand-entered and some are wrong; `resolveSubdomain` auto-recovers many (variants + cache). If a school 404s, get the user's Nutrislice URL — its subdomain/hall-slug/menu-type are authoritative.
- **Nutrition fields vary by school.** Standard keys: `protein`/`total_carb`/`total_fat`/`sodium`. Some schools (e.g. UW-Madison) null those and use `g_protein`/`g_carbs`/`g_fat`/`g_fiber`/`g_sugar`/`mg_sodium` — `parseMenuItems` falls back to these.
- **SQLite db path quirk:** `DATABASE_URL=file:./prisma/dev.db` resolves relative to the schema dir, so the real file is `backend/prisma/prisma/dev.db` (gitignored). Use `npx prisma db push` after schema edits.
- **Generated plan shape:** `{ breakfast[], lunch[], dinner[], totals, goals, availableCounts, halls }`. Food item: `{ id, name, calories, protein, carbs, fat, fiber, sodium, servingSize, isVegan/isVegetarian/isGlutenFree/isHalal/isKosher, containsNuts/containsDairy, hallName? }`.
- **Auth:** JWT stored in `localStorage['acadiet_token']`, sent as `Authorization: Bearer`. `optionalAuth` lets logged-in users get favorite-aware planning without requiring login.
- **Planner is deterministic** (no AI). `scoreItem` favorite boost is ×1.25. Meal split ratios: breakfast 0.25 / lunch 0.35 / dinner 0.35.
- **`.jsx` vs `.tsx`:** most components are `.jsx`; App/context/ErrorBoundary are typed. When a `.jsx` component is consumed by `App.tsx`, give optional props JSDoc types or `tsc --noEmit` may infer them as required.

## Working style
- **Subagents:** the user has granted standing permission to use subagents/forks freely — parallelize independent, non-overlapping workstreams without asking. Use `fork` for codebase work (inherits context). Skip them for small/sequential/tightly-coupled tasks where they'd add no parallel benefit.
