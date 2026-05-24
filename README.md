# DefenderMate

SOC alerts triage dashboard. NestJS + Prisma + SQLite backend, Next.js 15 frontend, pnpm monorepo.

## Quick start

```bash
pnpm install
```

**Backend:**
```bash
cd backend
cp .env.example .env        # edit DATABASE_URL and JWT_SECRET
pnpm prisma:migrate
pnpm seed                   # creates 1000 alerts + analyst user
pnpm dev                    # http://localhost:3001
```

**Frontend:**
```bash
cd frontend
pnpm dev                    # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `frontend/.env.local` if the default doesn't match.

## Login

```
analyst / DefenderM8!
```

## Env vars

**Backend** (in `backend/.env`):

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | — | `file:./prisma/dev.db` for local |
| `JWT_SECRET` | — | Required, no default |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `PORT` | `3001` | |

**Frontend** (in `frontend/.env.local`):

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

## API docs

Swagger at `http://localhost:3001/api/docs`.

## Deploy

Both packages have `nixpacks.toml` for Railway. Set env vars in the Railway dashboard, connect the repo, done. The backend seed runs on every deploy — fine for a demo, remove it before going to production.
