# AcaDiet

Optimize your college dining hall meals using real-time Nutrislice menu data. AcaDiet fetches live menus, lets you set calorie and macro targets, and algorithmically generates an optimal breakfast/lunch/dinner plan that fits your goals and dietary restrictions.

## Features

- **University search** — find your school's Nutrislice subdomain automatically from 45+ supported schools, or enter a custom subdomain
- **Nutrition goal setting** — set daily calorie target and protein/carb/fat macros with interactive sliders
- **Dietary restrictions** — filter by vegetarian, vegan, gluten-free, halal, kosher, nut-free, dairy-free
- **Live menu data** — fetches today's menu directly from Nutrislice via a backend proxy (handles CORS)
- **Optimized meal plan** — greedy algorithm selects the best items per meal period to hit your macro targets
- **Nutritional breakdown** — per-item and daily totals with visual progress bars vs goals
- **Graceful error handling** — friendly messages when a school isn't on Nutrislice, with alternative system info

## Tech Stack

- **Backend**: Node.js + Express — proxies Nutrislice API calls, runs meal plan algorithm
- **Frontend**: React + Tailwind CSS — multi-step wizard UI

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev       # starts on port 3001
```

### Frontend

```bash
cd frontend
npm install
npm start         # starts on port 3000, proxies /api/* to backend
```

Open http://localhost:3000

## Project Structure

```
acadiet/
├── backend/
│   ├── server.js                  # Express app entry
│   ├── routes/api.js              # API routes
│   ├── services/
│   │   ├── nutrislice.js          # Nutrislice API proxy + parser
│   │   └── mealPlanner.js         # Meal plan optimization algorithm
│   └── .env.example
└── frontend/
    └── src/
        ├── App.tsx                # 4-step wizard (University → Goals → Hall → Plan)
        ├── components/
        │   ├── UniversitySearch   # Debounced search with custom subdomain fallback
        │   ├── GoalForm           # Calorie/macro sliders + restriction toggles
        │   ├── DiningHallSelect   # Lists halls from Nutrislice API
        │   ├── MealPlanDisplay    # Breakfast/lunch/dinner cards + daily summary
        │   ├── FoodItem           # Individual food item with diet badges
        │   └── MacroBar           # Progress bar for each macro
        └── services/api.js        # Fetch wrappers for backend API
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/universities/search?q=` | Search known Nutrislice schools |
| GET | `/api/dining-halls?school=` | List dining halls for a school subdomain |
| POST | `/api/meal-plan/generate` | Generate optimized meal plan |

### POST /api/meal-plan/generate

```json
{
  "school": "ucla",
  "hall": "de-neve",
  "date": "2024-01-15",
  "goals": { "calories": 2000, "protein": 150, "carbs": 200, "fat": 65 },
  "restrictions": ["vegetarian", "gluten-free"]
}
```

## Meal Plan Algorithm

For each meal period (breakfast 25%, lunch 35%, dinner 35% of daily calories):

1. Filter items by dietary restrictions
2. Score remaining items by how well they fill the remaining macro gap (normalized 0-1 per macro)
3. Greedily select up to 4 items that stay within the calorie budget
4. Stop early once 90% of the meal's calorie target is met

## Notes on University Compatibility

Nutrislice powers dining systems at hundreds of universities. Schools that use alternative systems won't be accessible:

- **Cbord / GET Mobile** — common at large state universities
- **Transact / Bite** — used by several private schools
- **EAT@** — found at some UC system campuses

Check your university's dining website to see which platform they use.
