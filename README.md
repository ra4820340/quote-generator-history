# QuoteSpace — Quote Generator with History

A responsive quote generator built with Node.js, Express, HTML, CSS and vanilla JavaScript.

## Features
- Fetches a random quote from DummyJSON; falls back to the supplied local seed data if the API is offline.
- Saves quotes in server-side JSON history (`data/history.json`).
- Favorites, search across quote/author/topic, copy-to-clipboard, delete, and dark mode.
- Responsive layout.

## Run locally
Requires Node.js 18+. From this folder run:

```powershell
npm install; npm start
```

Open http://localhost:5000

## API routes
- `GET /api/quotes/random` — random API quote or local fallback
- `GET /api/history?q=search-term` — saved quote history with optional filtering
- `POST /api/history` — save a quote; JSON body requires `text` and `author`
- `GET /api/favorites` — favorites only
- `PATCH /api/favorites/:id` — set `{ "favorite": true }` or false
- `DELETE /api/history/:id` — remove a saved quote
- `GET /api/health` — health check

## Submission checklist
1. Run locally and test the quote, favorite, search, copy and delete features.
2. Push the project to GitHub.
3. Deploy to a Node hosting service. Ensure the host supports persistent disk storage if you want JSON history to survive restarts; otherwise use a hosted database for durable history.
4. Submit the live app URL and GitHub repository URL.

**Note:** History is persisted in a server-side JSON file, not a relational database table. If your evaluator strictly requires a database table, replace the JSON store with SQLite/PostgreSQL/MongoDB before submission.
