# AGENTS.md

## Project overview

Lost and Found Report Portal (LFRP). npm workspaces monorepo with two packages:

- `packages/backend` — Express 5 + TypeScript + Prisma/SQLite (the primary codebase)
- `packages/frontend` — Vite + React 19 + shadcn/ui + Tailwind v4 + wouter router

## Key commands

**Backend** (run from `packages/backend/`):

| Task              | Command                                                             |
| ----------------- | ------------------------------------------------------------------- |
| Dev server        | `npm run dev` (tsx watch)                                           |
| Build             | `npm run build` (tsc + copies `src/templates/` → `dist/templates/`) |
| Start (built)     | `npm start`                                                         |
| Format            | `npm run format` (also available from root)                         |
| Prisma generate   | `npx prisma generate`                                               |
| Prisma migrations | `npx prisma migrate dev`                                            |
| Prisma Studio     | `npm run prisma-studio`                                             |
| Clean dist        | `npm run clean`                                                     |

**Frontend** (run from `packages/frontend/`):

| Task  | Command              |
| ----- | -------------------- |
| Dev   | `npm run dev` (vite) |
| Build | `npm run build`      |
| Lint  | `npm run lint`       |

No tests, no CI exist yet.

## Build prerequisites

Run `npx prisma generate` before `npm run build`. Generated client → `src/generated/prisma/` (gitignored). Schema uses `moduleFormat = "esm"` and `importFileExtension = "js"` — all Prisma imports must use the `.js` extension even in `.ts` files.

## Architecture (backend)

- **Entrypoint:** `src/server.ts` — Express app + `main()`.
- **Routes:** `src/routes/authRoutes.ts`, `src/routes/postRoutes.ts`.
- **Controllers:** `src/controllers/authController.ts`, `src/controllers/postController.ts`.
- **Auth flow:** Register (`POST /api/auth/register`) → magic-link email → `GET /api/auth/verify`. Login (`POST /api/auth/login`) returns JWT. `GET /api/auth/status` checks verification. `authHandler` middleware (JWT) protects `/ping` and all `/api/post` routes.
- **Soft delete:** `deletePost` sets `published: false`, does not delete the row.
- **Mail:** `src/services/mail.ts` via nodemailer + Gmail SMTP. Requires `SMTP_USER` and `SMTP_PASS`.
- **Uploads:** multer file uploads served from `/uploads/images`. Config in `src/config/multer.ts`.
- **No input validation** on post routes; body fields are destructured directly.

## Architecture (frontend)

- Vite + React 19, routing via `wouter`, data fetching via `@tanstack/react-query`.
- shadcn/ui components in `src/components/ui/` (style: `radix-vega`). Use `npx shadcn add <component>` to add new ones.
- Pages: `Home`, `Login`, `Register`, `NewPost`, `UpdatePost`.
- Auth helpers in `src/lib/auth.ts`. Protected routes via `ProtectedRoute` component.

## Toolchain quirks

- **Module type mismatch:** Root `package.json` is `"type": "commonjs"`, backend is `"type": "module"` (ESM). tsconfig: `module: "ESNext"`, `moduleResolution: "bundler"`.
- **tsconfig:** `strict: false`, `noUncheckedIndexedAccess: true`, `"types": []`. The empty `types` array hides `@types/node` — `process`, `Buffer`, etc. are `unknown` to TypeScript. Compiles only because `strict: false` allows implicit `any`. TypeScript 6.x with `ignoreDeprecations: "6.0"`.
- **Prisma:** Uses `@prisma/adapter-better-sqlite3` (not default Node adapter). See `src/prisma.ts`. Prisma 7 with `prisma-client` generator (not legacy `prisma-client-js`). Config in `prisma.config.ts`.
- **Build copies templates:** `npm run build` copies `src/templates/` → `dist/templates/` for magic-link email HTML.

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

- Prettier (root `.prettierrc`): `semi: true`, `singleQuote: true`, `trailingComma: 'es5'`, `bracketSpacing: true`, `bracketSameLine: true` (2-space indent).
- `.editorconfig` says 4-space — **Prettier wins** (2 spaces).
- ESLint 10 is installed on backend but has **no config file** — does nothing. Frontend has a working ESLint 9 config (`eslint.config.js`).

## Gotchas

- Root `.gitignore` only covers `node_modules`. Backend `.gitignore` covers `dist/`, `.env`, `dev.db`, `uploads/`, and `src/generated/prisma/`. Running `git add .` from root can stage secrets.
- README endpoint table is stale — register and login are **POST**, not GET. Trust `src/routes/authRoutes.ts`.
- Frontend `components.json` uses shadcn style `radix-vega` — new components should match.
