# AGENTS.md

## Project overview

Lost and Found Report Portal (LFRP). Express 5 + TypeScript + Prisma/SQLite monorepo. Only the backend (`packages/backend`) has source code; `packages/frontend` is an empty placeholder.

## Key commands

All backend commands run from `packages/backend/`:

| Task                | Command                                                             |
| ------------------- | ------------------------------------------------------------------- |
| Dev server          | `npm run dev`                                                       |
| Build               | `npm run build`                                                     |
| Start (after build) | `npm start`                                                         |
| Format              | `npm run format` (root or backend)                                  |
| Prisma generate     | `npx prisma generate`                                               |
| Prisma migrations   | `npx prisma migrate dev`                                            |
| Prisma Studio       | `npm run prisma-studio` (wraps `npx -p better-sqlite3 -p prisma …`) |
| Clean dist          | `npm run clean`                                                     |

**No tests, no linter config, no CI exist yet.**

## Build prerequisites

Run `npx prisma generate` before `npm run build`. The generated client goes to `src/generated/prisma/` (gitignored). Schema uses `moduleFormat = "esm"` and `importFileExtension = "js"` — source imports must use `./generated/prisma/client.js` (`.js` extension on `.ts` files).

The build script also copies `src/templates/` into `dist/templates/` (for magic-link emails).

## Architecture

- **Entrypoint:** `src/server.ts` — Express app + `main()`.
- **Auth flow:** Magic-link registration (`POST /api/auth/register` → email → `GET /api/auth/verify`). Login returns a JWT directly (`POST /api/auth/login`). `GET /api/auth/status` checks verification. `authHandler` middleware (JWT) is applied to `/ping` and all `/api/post` routes. `GET /api/auth/*` routes are unprotected.
- **Soft delete:** `deletePost` sets `published: false`, does not delete the row.
- **Mail:** `src/services/mail.ts` sends magic-link emails via nodemailer + Gmail SMTP. Requires `SMTP_USER` and `SMTP_PASS` env vars.
- **No input validation** on post routes; request body fields are destructured directly.

## Toolchain quirks

- **Module type mismatch:** Root `package.json` uses `"type": "commonjs"` but backend uses `"type": "module"` (ESM). tsconfig sets `module: "ESNext"`.
- **tsconfig:** `strict: false`, `noUncheckedIndexedAccess: true`, `"types": []`. The empty `types` array hides `@types/node`, so `process`, `Buffer`, etc. are unknown to TypeScript — code compiles because `strict: false` allows implicit `any`, but type safety on Node globals is absent. TypeScript 6.x with `ignoreDeprecations: "6.0"`.
- **Prisma adapter:** Uses `@prisma/adapter-better-sqlite3` (not the default Node adapter). See `src/prisma.ts`. Prisma 7 with `prisma-client` generator (not legacy `prisma-client-js`).
- **Prisma config:** `prisma.config.ts` at backend root (Prisma 7 style), not just the schema datasource block.

## Environment

`packages/backend/.env` must contain:

```
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=<secret>
SMTP_USER=<gmail>
SMTP_PASS=<app-password>
```

`FRONTEND_URL` is optional (defaults to `http://localhost:5173`, used for magic-link URLs).

## Code style

- Prettier: `semi: true`, `singleQuote: true`, `trailingComma: 'es5'`, `bracketSpacing: true`, `bracketSameLine: true`. No explicit `tabWidth` (defaults to 2).
- `.editorconfig` specifies 4-space indent — **use Prettier as source of truth** (2 spaces).
- ESLint 10 is installed but has **no config file** — it won't do anything.

## Gotchas

- Root `.gitignore` only covers `node_modules`. The backend `.gitignore` covers `dist/`, `.env`, `dev.db`, and `src/generated/prisma/`. Running `git add .` from root can stage secrets.
- Frontend workspace is empty — don't look for code there.
