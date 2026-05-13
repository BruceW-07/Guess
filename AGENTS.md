# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router UI and API routes.
- `app/lyric/` holds the main game page and its CSS module.
- `app/api/lyric/` contains server endpoints for daily, random, author, and guess-record flows.
- `lib/` stores shared logic such as lyric selection, normalization, dates, and JSON-backed storage helpers.
- `data/seed/lyrics.json` is the seed lyric dataset. `data/runtime/` stores generated runtime files and should not be committed.
- `scripts/seed-lyrics.mjs` refreshes the seed dataset. `vendor/` contains external reference material and is not part of the app runtime.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the local dev server at `http://localhost:3000`.
- `npm run build` creates a production build and validates App Router output.
- `npm run typecheck` runs TypeScript checks with `tsc --noEmit`.
- `npm run lint` runs Next.js linting.
- `npm run seed:lyrics` regenerates `data/seed/lyrics.json`.

## Coding Style & Naming Conventions
- Use TypeScript and functional React components.
- Follow existing 2-space indentation and keep imports grouped by external, internal, then local modules.
- Use `camelCase` for variables/functions, `PascalCase` for React components, and lowercase route folder names.
- Prefer small helpers in `lib/` for reusable logic rather than duplicating code in pages or route handlers.
- Keep UI styles in colocated CSS modules such as `page.module.css`.

## Testing Guidelines
- There is no dedicated test framework yet; use `npm run typecheck` and `npm run build` as the minimum validation before submitting changes.
- For UI changes, verify `/lyric` manually in daily, random, and author modes.
- If you add tests later, place them near the feature or under a dedicated `tests/` directory and keep names feature-oriented.

## Commit & Pull Request Guidelines
- Follow the current commit style: short, imperative summaries such as `Show full lyrics after solve` or `Remove paid and sharing features`.
- Keep commits focused; separate UI, API, and dataset changes when practical.
- PRs should include:
  - a short description of the user-facing change,
  - any affected routes or data files,
  - screenshots or a short recording for UI changes,
  - the validation commands you ran.

## Data & Configuration Notes
- Do not commit files from `data/runtime/`, `.next/`, or `node_modules/`.
- When modifying the lyric dataset, keep only lyric lines in `data/seed/lyrics.json`.
- Remove metadata and credit lines such as `作词`/`作曲`/`编曲`, recording or mixing notes, performer labels like `原唱`/`演唱`, and thank-you or production credits before committing.
