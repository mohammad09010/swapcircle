# Sprint 4: Kickoff (Sprint 3 review)

**Date:** 24 March 2026
**Attendees:** All four team members (Betab, Sagar, Nitesh, Arjun)
**Duration:** 45 min

## Context
Sprint 3 review confirmed the Sprint 3 MVP is stable and database-driven. We were asked to define the Sprint 4 scope.

## Decisions

The team agreed Sprint 4 will deliver these features (mapped to the assessment brief):

- **User login**: bcryptjs + express-session (assigned: Betab)
- **Real swap workflow**: replace the UI-only modal with full state machine (Betab)
- **Basic + advanced ratings system**: 5-star ratings with comments + points (Sagar)
- **In-app messaging**: per-swap conversation threads (Sagar)
- **Advanced matching / recommendations**: Jaccard tag overlap + location boost (Sagar)
- **External API**: Open-Meteo weather on item detail page (Sagar)
- **CI/CD**: GitHub Actions: lint, unit tests, Docker build (Nitesh)
- **Polished UI/UX**: auth pages, dashboard, leaderboard, favourites (Arjun + Betab)
- **Final report + presentation**: Arjun

## Actions

- [x] Update branch protection on `main` so PRs need review.
- [x] Create new milestone "Sprint 4" in GitHub Projects, move backlog cards in.
- [x] Each member opens at least one issue tagged `sprint-4` for their feature.

## Risks

- Time pressure from career-week clashes — mitigated by parallelising backend (Sagar) and frontend (Betab/Arjun) work.
- Schema migration on existing dev volumes — agreed everyone runs `docker compose down -v` once.
