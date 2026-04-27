# Contributing to Gotta Go

Welcome. The bar here is _fast and honest_, not big and corporate.

## Local setup

```bash
git clone https://github.com/oscar-leung/restroom-finder.git
cd restroom-finder
npm install
npm run dev          # http://localhost:5173
```

That's it. No backend, no env vars required. Add an optional `.env`
with `VITE_GA_ID=` if you want analytics in dev.

## Branching & PRs

- Branch off `main`. Name like `feat/country-filter` or `fix/swipe-bug`.
- Keep PRs small. < 300 lines diff is the goal.
- Fill in the PR template (it'll auto-load when you open the PR).
- Every PR gets a `pr-preview` GitHub Action build. Wait for green.

## Commit messages

Conventional Commits, please.

```
feat(hero): add #2 nearest swipe affordance
fix(map): pin offset on retina displays
chore(deps): bump leaflet to 1.9.5
docs(roadmap): mark country filter as in-progress
test(distance): add Haversine edge cases
```

Co-author lines for AI assistance are welcome but optional:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## Feature flags & A/B tests

Read `src/utils/featureFlags.js` first. New user-facing changes should:

1. Be reachable behind a flag in `FLAGS`.
2. Fire an `experiment_view` event for variant exposure (the framework
   does this automatically — just call `getFlag(key)`).
3. Have an explicit success metric in the PR description, e.g.:
   > Success = `go_clicked` rate per `experiment_view` increases ≥ 5%
   > with a p-value < 0.05 over 7 days.

Don't ship UX changes to 100% on day one. The framework lets you ramp.

## Adding a new bathroom data source

See `src/services/restroomApi.js`. Each source is a function that
returns an array of objects with this shape:

```js
{
  id: string,                       // unique across sources
  source: "refuge" | "osm" | "user" | "your_new_source",
  name: string,
  street: string,
  city: string,
  latitude: number,
  longitude: number,
  accessible: boolean,
  unisex: boolean,
  upvote: number,
  downvote: number,
  // optional
  directions: string,
  comment: string,
  opening_hours: string,
  fee: number | null,
}
```

The merge function dedupes by lat/lng proximity (50m).

## Style

- React functional components. Hooks for state.
- No CSS frameworks — plain CSS in `src/index.css` with CSS custom
  properties. Mobile-first, then `@media (min-width: 640px)` for desktop.
- No new runtime dependencies without a real reason. Bundle size matters.

## Tests

We don't have many yet. PRs adding tests are super welcome — Vitest
is the planned framework (already pulls in via Vite).

## Release process

`main` is always deployable. Push to `main` triggers the GitHub Pages
deploy. PR previews are built but not auto-deployed (yet).

## Questions?

Open a Discussion or just open a draft PR. We're not formal here.
