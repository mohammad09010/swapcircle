# SwapCircle - Sprint 3

- Express + PUG + MySQL + Docker
- DB-driven pages for **home, items, item detail, tags, tag items, users, and user profile**
- UI-only **Swap Request** modal for Sprint 3
- privacy-safe member directory (emails hidden)
- visible safety guidance across the app
- friendly 404 and server error pages

## Sprint 3 scope covered

### Implemented stories
- **US-01** Browse all items
- **US-02** Search and filter items
- **US-03** View item detail page
- **US-04** Browse tags/categories
- **US-05** Browse users and profiles
- **US-06** Safety guidance visible in the UI
- **US-07** Swap request modal **UI only**

### Still intentionally deferred to Sprint 4
- authentication/login
- real messaging
- real swap workflow state changes
- ratings/reviews backend
- advanced moderation/admin tools
- GitHub Actions / CI workflow polish

## Run with Docker

```bash
docker compose down -v
docker compose up --build
```

Open the app at:

- `http://localhost:3000`
- `http://localhost:3000/health`

Stop containers:

```bash
docker compose down
```

## Important database reset note

The SQL seed files only run the first time MySQL creates its data volume.

If you change schema or seed data, run:

```bash
docker compose down -v
docker compose up --build
```

## Main routes

- `/`
- `/health`
- `/items`
- `/items/:id`
- `/users`
- `/users/:id`
- `/tags`
- `/tags/:id/items`
- `/support`
- `/my-swaps`

## Exact image locations to insert your PNG files

All image paths are already wired into the database seeds and templates. Save your PNG files in these exact locations and filenames.

### Hero / UI images
- `public/images/hero/record-shelf.png`
- `public/images/ui/404-illustration.png`

### Category images
- `public/images/categories/fantasy.png`
- `public/images/categories/classics.png`
- `public/images/categories/rock.png`
- `public/images/categories/jazz.png`
- `public/images/categories/scifi.png`
- `public/images/categories/mystery.png`

### User profile images
- `public/images/users/sarah-miller.png`
- `public/images/users/alex-record.png`
- `public/images/users/marcus-chen.png`
- `public/images/users/elena-rodriguez.png`
- `public/images/users/david-kim.png`

### Item images
- `public/images/items/the-hobbit-main.png`
- `public/images/items/the-hobbit-2.png`
- `public/images/items/the-hobbit-3.png`
- `public/images/items/the-hobbit-4.png`
- `public/images/items/kind-of-blue.png`
- `public/images/items/dune.png`
- `public/images/items/abbey-road.png`
- `public/images/items/1984.png`
- `public/images/items/name-of-the-wind.png`
- `public/images/items/american-gods.png`
- `public/images/items/the-witcher.png`
- `public/images/items/mistborn.png`
- `public/images/items/neuromancer.png`
- `public/images/items/modern-poetry-vol-1.png`
- `public/images/items/design-systems.png`
- `public/images/items/polaroid-go-camera.png`

## Notes

This build stays aligned to the Sprint 2 specification and Sprint 3 expectations:

- required pages are database driven
- search/filter works on `/items`
- tag browsing works on `/tags` and `/tags/:id/items`
- member directory and profile pages are DB-driven
- no public email addresses are shown
- safety guidance is prominent
- invalid records render a friendly page instead of raw text
- the modal is **demo only** and does not fake backend messaging

## What to leave for Sprint 4
- login/authentication
- in-app messaging backend
- points or ratings
- recommendation or matching logic
- GitHub Actions CI/CD polish
