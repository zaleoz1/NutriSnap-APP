# NutriSnap Backend

## Setup
1) `cp .env.example .env` e ajuste as variáveis.
2) Crie o banco: `mysql -u root -p < schema.sql`
3) `npm i`
4) `npm run dev`

Rotas:
- `POST /api/auth/register` {name, email, password}
- `POST /api/auth/login` {email, password}
- `GET /api/meals` (Bearer token)
- `POST /api/meals` {items, total_calories, timestamp}
- `DELETE /api/meals/:id`
- `GET /api/goals`
- `POST /api/goals` {current_weight, goal_weight, days, daily_calories}
- `GET /api/workouts`
- `POST /api/workouts` {plan}
- `POST /api/analyze` {base64ImageData}
