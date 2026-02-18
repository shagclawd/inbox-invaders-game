# ClosePilot

ClosePilot is a realtor-focused pipeline + compliance copilot business.

## Live site
- Current: `https://shagclawd.github.io/inbox-invaders-game/`
- Planned domain: `https://closepilot.xyz`

## What this repo contains
- `index.html` — landing page
- `backend/` — backend MVP scaffold (Fastify + Postgres + Stripe webhook)
- `realtor-offer.md` — offer architecture
- `realtor-outreach.txt` — outbound scripts and social posts
- `game/` — archived Inbox Invaders mini-game asset

## Revenue model
1. Pilot setup + monthly retainer (immediate revenue)
2. Productized playbooks for team licensing (margin expansion)
3. SaaS layer for recurring software revenue (scale)

## Local backend run
```bash
cd backend
npm install
npm run dev
curl http://localhost:8787/api/health
```