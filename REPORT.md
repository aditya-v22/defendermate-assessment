# DefenderMate

Built a SOC alerts dashboard — login, alert triage list, and a summary dashboard. The idea is that an analyst opens it, gets a quick read on what's burning, drills into the list, opens an alert, updates it, moves on.

---

## How it's put together

Three pages. Dashboard is the landing view — four stat cards (total, critical, open, investigating) and three Recharts charts. Each chart segment is clickable and pushes to the alerts list with that filter pre-applied, so "show me all critical alerts" is literally one click from the dashboard. There's also a 30-day timeline at the bottom so you can see if you're getting hit harder this week than last.

The alerts list is where most of the work happens. Filters for severity, status, category, and source (all multi-select popovers), a date range, and a debounced text search. Everything is in the URL — `?severity=critical,high&status=new` — which means you can share a filtered view with a teammate or bookmark it and come back later. Sorting on timestamp and severity works by clicking the column header.

Clicking a row opens the detail panel. I built two modes: overlay (the panel floats over the table, fixed to the right side) and docked (the table shrinks and the panel sits alongside it). Which mode you're in is saved to localStorage. The selected alert ID is in the URL too, so you can link someone directly to a specific alert and they'll land with the panel open. From the panel you can update status inline, dismiss as false positive in one click, or copy a direct link to the clipboard.

---

## Stack and why

Backend is NestJS + Prisma 7 + SQLite via `@prisma/adapter-libsql`. SQLite because there's no database to provision, no connection string to figure out — it's a file, and Prisma handles the migrations. NestJS because the module system makes auth and alerts genuinely separate — `AuthModule` doesn't know `AlertsModule` exists. JWT auth with bcrypt hashes.

Frontend is Next.js App Router + TanStack Query + shadcn/ui. All server state (alerts list, single alert, dashboard stats, timeline) goes through TanStack Query — loading states, caching, stale-while-revalidate, mutation + invalidation. I didn't add a global store because there's no state that needs to be global — filters live in the URL, panel mode lives in localStorage. That's it.

Auth tokens end up in two places: `localStorage` (read by the Axios interceptor to attach the `Authorization` header) and a plain cookie (read by the Next.js middleware to gate routes server-side). This is the part I'm least happy with — the cookie is client-set, not HttpOnly, which means it's accessible to JS and doesn't meaningfully improve security over just checking localStorage. I wanted to set it from a Route Handler so it'd be HttpOnly, but that would've needed a `/api/auth/session` route and some refactoring I didn't have time for. It works for the purposes of the demo but I wouldn't ship it this way.

For the mock data I used Gemini to figure out what fields and values actually show up in SOC alert data — what a plausible `rawEvent` looks like from a firewall vs an email gateway, what categories and sources you'd realistically have. Then wrote the generator myself with weighted random distributions so severity has a long tail (lots of info/low, not many critical), timestamps are recency-biased, and each source type produces a different `rawEvent` shape.

---

## What I left out

Didn't do realtime updates (SSE would be the right approach — `@Sse()` on the backend, `queryClient.invalidateQueries` in the handler on the frontend). No saved filter presets. No bulk status updates. No tests — would prioritise the alerts service filtering logic if I had another few hours.

## What I'd fix first

The middleware just checks `request.cookies.get('access_token')?.value` — truthy means authenticated. It doesn't verify the JWT or check expiry. So an expired token still passes the gate. Easy fix — decode and check `exp` — but didn't get to it.

The `to` date filter also doesn't expand to end-of-day. If you pick June 5 as the end date, you'll miss alerts timestamped at 14:00 on June 5 because the filter does `lte: new Date('2026-06-05')` which is midnight. Should be `23:59:59.999`. Classic off-by-one.

---

About 7 hours total, two evenings.
