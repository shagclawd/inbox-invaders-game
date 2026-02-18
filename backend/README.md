# DealOS Backend (MVP)

This folder defines the backend for the Realtor Pipeline + Compliance Copilot.

## Goals
- Persist client, lead, and deal data
- Run deadline escalation workflows (nudge -> hard alarm)
- Sync subscription status from Stripe
- Expose clean API for future dashboard

## Proposed Stack
- **Runtime:** Node.js (Fastify)
- **DB:** PostgreSQL (Neon or Supabase)
- **Auth:** Magic link / OAuth later
- **Billing:** Stripe subscriptions + webhooks
- **Jobs:** Cron worker for reminders/escalations
- **Hosting:** Render / Railway / Fly.io

## Data Model (MVP)
- accounts
- clients
- leads
- deals
- milestones
- reminders
- subscriptions

See `schema.sql`.

## API (MVP)
- `GET /api/health`
- `POST /api/intake`
- `POST /api/leads`
- `POST /api/deals/:id/events`
- `POST /api/escalations/run`
- `POST /api/stripe/webhook`

See `server.js` for initial scaffold.

## Run locally
```bash
npm install
npm run dev
```

Then test:
```bash
curl http://localhost:8787/api/health
```