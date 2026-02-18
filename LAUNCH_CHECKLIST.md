# ClosePilot Launch Checklist

## 1) Domain + DNS
- [ ] Buy `closepilot.xyz`
- [ ] In DNS, create CNAME: `www` -> `shagclawd.github.io`
- [ ] Add A records for apex (`@`) to GitHub Pages IPs:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- [ ] In repo settings -> Pages -> Custom domain: `closepilot.xyz`
- [ ] Check “Enforce HTTPS” once cert is issued

## 2) Conversion plumbing
- [ ] Create Stripe product: `ClosePilot Pilot` ($149 setup + first month)
- [ ] Add payment link and replace `closepilot.xyz/checkout`
- [ ] Create booking link and replace `closepilot.xyz/audit`
- [ ] Create intake form and replace `closepilot.xyz/intake`

## 3) Backend deploy
- [ ] Create Postgres DB (Neon/Supabase)
- [ ] Deploy `backend/` on Render (use `deploy-render.yaml`)
- [ ] Set env vars: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Configure Stripe webhook URL: `/api/stripe/webhook`
- [ ] Verify `GET /api/health` and one test webhook delivery

## 4) Sales motion
- [ ] Send 20 outbound DMs from `realtor-outreach.txt`
- [ ] Publish 5 X posts for pilot offer
- [ ] Book first 3 workflow audits
- [ ] Close first pilot client
