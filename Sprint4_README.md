# SwapCircle — Sprint 4 MVP

**Module:** Software Engineering (CMP-N204-0)
**Theme:** Sharing, Exchange and Building Community
**Sprint:** 4 — Final MVP

A full-stack Node.js / Express / MySQL web app for swapping books and vinyl records, deployed in Docker, tested in CI/CD via GitHub Actions, and featuring authentication, a real swap workflow, in-app messaging, ratings, points, recommendations and an external weather API.

---

## Team

| Member | ID | Sprint 4 Role |
|---|---|---|
| Mohammad Betab Alam | A00031761 | Auth + Swap workflow + Repo coordination |
| Sagar Kumar Sharma | A00032573 | Recommendations + Weather API + Backend |
| Nitesh Shah | A00023399 | Docker + GitHub Actions + DevOps |
| Arjun Mahato | A00031649 | UI/UX + Documentation + Presentation |

---

## What is new in Sprint 4

| Sprint 3 (read-only MVP) | Sprint 4 (interactive MVP) |
|---|---|
| UI-only swap modal | **Full swap workflow** (send / accept / reject / complete / cancel) |
| No login | **Real authentication** (bcrypt + sessions) |
| Static "My Swaps" page | **Inbox** (incoming + outgoing) and **conversation threads** |
| Rating shown on profile | **Star rating system** with comments after completed swaps |
| Static recent-swap list | **Personalised recommendations** (Jaccard tag overlap + location boost + owner rating) |
| No external API | **Open-Meteo weather** on every item detail page |
| Manual run only | **GitHub Actions CI** (Node syntax check, unit tests, Docker build) |
| Text-only image URL | **Multi-image item upload** (1–5 images with cover photo and gallery) |
| – | **Points + leaderboard**, **favourites**, **notifications**, **dashboard**, **list-an-item form** |

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, **Pug** templates
- **Backend:** **Node.js 20**, **Express.js 4**, **bcryptjs**, **express-session**, **multer**
- **Database:** **MySQL 8**
- **DevOps:** **Docker** + **Docker Compose**, **GitHub Actions**
- **External API:** **Open-Meteo** (no key required)
- **Project management:** GitHub Projects (Kanban)

---

## Repository layout

```
swapcircle/
├── .github/workflows/ci.yml         # GitHub Action: lint, tests, Docker build
├── docker-compose.yml               # web + MySQL services
├── Dockerfile                       # node:20-alpine production image
├── package.json
├── mysql/init/                      # SQL run on first DB boot
│   ├── 001_schema.sql               (Sprint 3) users, items, tags
│   ├── 002_seed.sql                 (Sprint 3) demo data
│   ├── 003_tags.sql / 004_seed_tags.sql
│   ├── 005_sprint4_schema.sql       NEW: passwords, swaps, messages,
│   │                                     ratings, favorites, notifs
│   └── 006_sprint4_seed.sql         NEW: hashed demo passwords + sample data
├── src/
│   ├── app.js                       Express + sessions wiring
│   ├── db.js                        MySQL pool with retry-on-boot
│   ├── middleware/auth.js           attachCurrentUser, requireAuth
│   ├── routes/
│   │   ├── auth.js                  /auth/login, /auth/register, /auth/logout
│   │   ├── swaps.js                 /my-swaps inbox + conversation + actions
│   │   ├── items.js                 listings + detail (with weather)
│   │   ├── items_create.js          /items/new form
│   │   ├── dashboard.js             /dashboard, /leaderboard, /favorites
│   │   ├── users.js, tags.js, index.js, health.js, static.js
│   └── utils/
│       ├── points.js                points + level tiers
│       ├── notifications.js         add/list/markRead
│       ├── recommendations.js       Jaccard + location + rating scoring
│       ├── weather.js               Open-Meteo client with 10-min cache
│       └── view-helpers.js          relative date + gallery helper
├── views/                           Pug templates
│   ├── layout.pug                   auth-aware navbar
│   ├── auth/login.pug, auth/register.pug
│   ├── my_swaps.pug, swap_thread.pug
│   ├── dashboard.pug, leaderboard.pug, favorites.pug
│   ├── item_new.pug, item_detail.pug, items.pug
│   └── (existing Sprint 3 pages)
├── public/
│   ├── css/style.css                (Sprint 3 base)
│   ├── css/sprint4.css              NEW: auth, swap, dashboard, leaderboard
│   ├── js/app.js                    image gallery + upload preview + toast
│   └── js/theme.js
└── tests/helpers.test.js            unit tests, run by CI
```

---

## How to run the app step-by-step

### 1. Prerequisites

- **Docker Desktop** (Windows / macOS / Linux). Confirm with `docker --version`.
- A free TCP port `3000` (web) and `3307` (MySQL).

### 2. Clone the repository

```bash
git clone https://github.com/mohammad09010/swapcircle.git
cd swapcircle
```

### 3. Create the environment file

```bash
cp .env.example .env       # macOS/Linux
copy .env.example .env     # Windows CMD
```

You may edit `.env` to pick a stronger `SESSION_SECRET`. Defaults work for local dev.

### 4. Start the containers

First clean run (rebuild + reseed DB):

```bash
docker compose down -v
docker compose up --build
```

Subsequent runs (keeps DB):

```bash
docker compose up
```

Wait for the line:

```
swapcircle-web | SwapCircle running at http://localhost:3000
```

### 5. Open the app

Visit **http://localhost:3000**.

### 6. Sign in with a demo account

| Email | Password | Role |
|---|---|---|
| `sarah@example.com` | `Password123!` | Power User, lots of items |
| `alex@example.com`  | `Password123!` | Top Swapper, has open requests |
| `david@example.com` | `Password123!` | Top Contributor |
| `marcus@example.com`| `Password123!` | Verified Swapper |
| `elena@example.com` | `Password123!` | Trusted Member |

Or click **Join** in the navbar to register a fresh account.

### 7. Stop the containers

```bash
docker compose down              
docker compose down -v           
```

---

## Demo script (for the Sprint 4 review)

A 4-minute walkthrough that touches every Sprint 4 feature:

1. **Open** http://localhost:3000, click **Sign in**, sign in as `alex@example.com` / `Password123!`.
2. The **navbar** now shows a points pill, a notification bell with a badge and a logout button. The home page shows a **"Recommended for Alex"** section with personalised match scores.
3. Click any item card → on the **detail page** notice:
   - The **Open-Meteo weather card** for the item's city.
   - A real **swap-request form** with a dropdown of items you can offer.
   - The **save (♥) form** in the top-right.
4. Submit a swap request → it lands on the **conversation page**. Send a message, then sign out.
5. Sign in as `sarah@example.com` (the owner) → click **My Swaps** → see the request in the **Incoming** column → accept it → reply in chat → click **Mark as completed**.
6. Submit a **5-star rating** with a comment. Notice your **points** in the navbar increase.
7. Visit **/leaderboard** to see the top-points members ranked.
8. Visit **/dashboard** for stats, recommendations and notifications.
9. Click **+ List a new item** → fill the form → submit → confirm the new item appears under your profile and is searchable.

---

## Recommendation algorithm

`src/utils/recommendations.js` exports `recommendForUser(userId, limit)`. The score for each item is:

```
score = jaccard(userTags, itemTags)         // 0..1, dominant signal
      + 0.20  if user's city matches item's location
      + 0.15 * (ownerRating / 5)            // small trust nudge
```

- The user's tag set is the union of their explicit `user_tag_preferences` and the tags of every item they have favourited.
- Items the user already owns are excluded.
- Results are cached for 60 seconds in process to keep the home page snappy.

Anonymous visitors get a fallback list (`is_featured DESC, created_at DESC`).

The item-detail page also calls `similarItems(itemId)`, which is a pure SQL query that ranks other items by tag overlap.

---

## Points system

| Action | Points | Level tier |
|---|---|---|
| Complete a swap | +10 | 0–19 → New Member |
| List a new item | +5 | 20–49 → Rising Member |
| Submit a rating | +2 | 50–99 → Active Swapper |
| | | 100–199 → Trusted Member |
| | | 200+ → Top Swapper |

Defined in `src/utils/points.js`. Awards happen inside the swap-completion route (`POST /my-swaps/:id/complete`), the new-item route (`POST /items/new`) and the rating route (`POST /my-swaps/:id/rate`).

---

## Database design (Sprint 4 additions)

```
users (Sprint 3) + password_hash + points + rating_count + rating_sum

swap_requests
  request_id, requester_id → users, owner_id → users,
  target_item_id → items, offered_item_id → items?,
  message, status enum, timestamps

messages
  message_id, swap_request_id → swap_requests, sender_id → users,
  body, is_read, created_at

ratings
  rating_id, swap_request_id, rater_id, ratee_id, stars(1..5),
  comment, created_at
  UNIQUE(swap_request_id, rater_id)

favorites
  user_id, item_id, created_at — composite PK

user_tag_preferences
  user_id, tag_id, weight — used by recommender

notifications
  notification_id, user_id, body, link, is_read, created_at
```

ER additions:
- `users 1 ─< swap_requests >─ 1 users` (a swap has a requester and an owner)
- `swap_requests 1 ─< messages` (a swap can have many messages)
- `swap_requests 1 ─< ratings` (each completed swap can have up to two ratings, one per side)
- `users 1 ─< favorites >─ 1 items` (many-to-many bookmarks)

---

## CI/CD — GitHub Actions

`.github/workflows/ci.yml` runs on every push and pull-request to `main`. Two jobs:

1. **node-build** — installs dependencies, runs `node --check` on every `src/**/*.js`, runs `npm run lint` and `npm test` (Node's built-in test runner).
2. **docker-build** — uses `docker/build-push-action` to confirm the image still builds. Caches Docker layers via GitHub Actions cache.

Manual trigger: **Actions → SwapCircle CI → Run workflow** on GitHub.

---

## External API — Open-Meteo

Each item-detail page fetches real-time weather for the item's city via the public Open-Meteo Forecast API (`https://api.open-meteo.com/v1/forecast`). Why Open-Meteo:

- **No API key** — perfect for a student project, no secrets in the repo.
- 10-minute in-process cache (`src/utils/weather.js`) reduces the rate-limit footprint.
- 3-second timeout, fail-soft — if the API is down the page renders without a weather card instead of erroring.

---

## Manual test matrix (Sprint 4)

| Route | Auth required | Notes |
|---|---|---|
| `GET /` | No | Hero + featured + latest. Shows recommendations when logged in. |
| `GET /items` | No | Filter by type, search by query, sort. |
| `GET /items/:id` | No | Renders weather, similar items. Logged-in users see swap form + favourite. |
| `GET /items/new` | Yes | Form with tag picker. Awards +5 points on submit. |
| `GET /users` | No | Sorted by points, shows level tier. |
| `GET /users/:id` | No | Profile + recent ratings list. |
| `GET /tags` / `GET /tags/:id/items` | No | Categories. |
| `GET /leaderboard` | No | Top 20 by points. |
| `GET /settings` / `POST /settings/profile` / `POST /settings/password` / `POST /settings/preferences` | Yes | Profile edit, password change, recommendation tags. |
| `GET /referral` | Yes | Personal referral code + shareable link with copy button. |
| `GET /support` | No | FAQ with safety guide and contact details. |
| `GET /dashboard` | Yes | Stats + recommendations + notifications. |
| `GET /favorites` | Yes | Saved items. |
| `GET /my-swaps` | Yes | Inbox + outbox. |
| `GET /my-swaps/:id` | Yes | Conversation, status actions, rating form. |
| `POST /my-swaps/new` | Yes | Sends a swap request. |
| `POST /my-swaps/:id/{accept,reject,cancel,complete}` | Yes | State transitions. |
| `POST /my-swaps/:id/messages` | Yes | Sends a chat message. |
| `POST /my-swaps/:id/rate` | Yes | Stars + optional comment. |
| `POST /favorites/:itemId/toggle` | Yes | Add / remove favourite. |
| `POST /notifications/read` | Yes | Marks all read. |
| `GET /auth/login` / `POST /auth/login` | No | bcrypt password compare. |
| `GET /auth/register` / `POST /auth/register` | No | Min 8-char password, unique email. |
| `POST /auth/logout` | Yes | Destroys the session. |
| `GET /health` | No | DB ping check. |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `connect ECONNREFUSED db:3306` on first boot | Normal; the web container retries up to 30× while MySQL initialises. |
| `Table 'swapcircle.swap_requests' doesn't exist` | DB volume was created before Sprint 4 schema. Run `docker compose down -v && docker compose up --build`. |
| Logging in immediately bounces back | Browser cookies for `swapcircle.sid` are blocked. Allow cookies for `localhost`. |
| Weather card never appears | The item's city isn't in the lookup table in `src/utils/weather.js`. Add the city or pick a seeded one (Portland, Berlin, London…). |
| Port 3000 in use | Change the host port in `docker-compose.yml` (`"3000:3000"` → `"3010:3000"`). |

---

## Contact

| Member | Email |
|---|---|
| Betab | almmohammad291@gmail.com |
| Nitesh | shahnitesh600@gmail.com |
| Sagar | thesagarsharma27@gmail.com |
| Arjun | arjunmahato14333@gmail.com |
