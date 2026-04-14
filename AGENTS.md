# AGENTS.md

## Project overview

Lost and Found Report Portal (LFRP). Express 5 + TypeScript + Prisma/SQLite monorepo. Only the backend (`packages/backend`) has source code; `packages/frontend` is an empty placeholder.

## Key commands

All backend commands run from `packages/backend/`:

| Task                    | Command                            |
| ----------------------- | ---------------------------------- |
| Dev server (hot reload) | `npm run dev`                      |
| Build                   | `npm run build`                    |
| Start (after build)     | `npm start`                        |
| Format code             | `npm run format` (root or backend) |
| Prisma generate         | `npx prisma generate`              |
| Prisma migrations       | `npx prisma migrate dev`           |
| Prisma Studio           | `npm run prisma-studio`            |
| Clean dist              | `npm run clean`                    |

**No tests, no linter config, no CI exist yet.**

## Build prerequisites

`npx prisma generate` must run before `npm run build`. The generated client goes to `src/generated/prisma/` (gitignored) and is consumed by `src/prisma.ts`.

## Architecture notes

- **Entrypoint:** `src/server.ts` → Express app setup + `main()` function.
- **Module type mismatch:** Root `package.json` uses `"type": "commonjs"` but the backend uses `"type": "module"` (ESM). tsconfig sets `module: "ESNext"`.
- **tsconfig:** `strict: false`. `noUncheckedIndexedAccess: true` is on. TypeScript 6.x with `ignoreDeprecations: "6.0"`.
- **Prisma adapter:** Uses `@prisma/adapter-better-sqlite3` (not the default Node adapter). See `src/prisma.ts`.
- **Soft delete:** `deletePost` sets `published: false`, does not delete the row.
- **Auth incomplete:** `authController.ts` is empty. `authHandler` middleware (JWT) exists but is only applied to `GET /ping`. All `/api/*` routes are unprotected.
- **No input validation** on any route; request body fields are destructured directly.

## Environment

`.env` at `packages/backend/.env` holds `PORT`, `DATABASE_URL` (file:./dev.db), and `JWT_SECRET`. The file is currently staged in git despite being listed in `.gitignore`.

## Code style

- Prettier config (root `.prettierrc`): `semi: true`, `singleQuote: true`, `trailingComma: 'es5'`, `bracketSpacing: true`, `bracketSameLine: true`. No explicit `tabWidth` (Prettier defaults to 2).
- ESLint is installed but has **no config file** — it won't do anything without one.
- `.editorconfig`: 4-space indent (2 for YAML/HTML), max line length 80. Note the indent conflict with Prettier — use Prettier as source of truth for formatting.

## Gotchas

- `node_modules`, `dist/`, `src/generated/prisma/`, `.env`, and `dev.db` are gitignored but several are currently staged for a first commit.
- `prisma.config.ts` at backend root is the Prisma config (not the old-style `prisma/schema.prisma` datasource block alone).
- Frontend workspace is empty — don't look for code there.
