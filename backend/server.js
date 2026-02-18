import Fastify from 'fastify';
import pg from 'pg';
import Stripe from 'stripe';
import crypto from 'crypto';

const app = Fastify({ logger: true });
const { Pool } = pg;

const port = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } })
  : null;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function id() {
  return crypto.randomUUID();
}

app.get('/api/health', async () => {
  let db = false;
  if (pool) {
    try {
      await pool.query('select 1');
      db = true;
    } catch {
      db = false;
    }
  }
  return { ok: true, service: 'dealos-backend', db, ts: new Date().toISOString() };
});

app.post('/api/intake', async (req, reply) => {
  const body = req.body || {};

  if (!pool) {
    return reply.code(201).send({ ok: true, mode: 'dry-run', stage: 'intake-received', payload: body });
  }

  const accountId = id();
  const clientId = id();
  const email = body.email || `unknown+${Date.now()}@example.com`;

  await pool.query(
    `insert into accounts (id, email, role) values ($1, $2, $3)
     on conflict (email) do update set email = excluded.email`,
    [accountId, email, 'client']
  );

  await pool.query(
    `insert into clients (id, account_id, brokerage_name, market, plan)
     values ($1, $2, $3, $4, $5)`,
    [clientId, accountId, body.brokerage_name || null, body.market || null, body.plan || 'pilot']
  );

  return reply.code(201).send({ ok: true, clientId, stage: 'intake-created' });
});

app.post('/api/leads', async (req, reply) => {
  const body = req.body || {};

  if (!pool) {
    return reply.code(201).send({ ok: true, mode: 'dry-run', stage: 'lead-created', payload: body });
  }

  const leadId = id();
  const score = Number(body.score ?? 50);

  await pool.query(
    `insert into leads (id, client_id, full_name, source, intent, stage, score, next_action_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      leadId,
      body.client_id,
      body.full_name || null,
      body.source || null,
      body.intent || null,
      body.stage || 'new',
      score,
      body.next_action_at || null,
    ]
  );

  return reply.code(201).send({ ok: true, leadId, stage: 'lead-created' });
});

app.post('/api/deals/:id/events', async (req, reply) => {
  const { id: dealId } = req.params;
  const body = req.body || {};

  if (!pool) {
    return { ok: true, mode: 'dry-run', dealId, event: body };
  }

  const milestoneId = id();
  await pool.query(
    `insert into milestones (id, deal_id, kind, due_at, risk_level)
     values ($1, $2, $3, $4, $5)`,
    [milestoneId, dealId, body.kind || 'generic', body.due_at, body.risk_level || 'normal']
  );

  return { ok: true, dealId, milestoneId };
});

app.post('/api/escalations/run', async () => {
  if (!pool) return { ok: true, mode: 'dry-run', processed: 0, escalated: 0 };

  const q = await pool.query(
    `select m.id, m.deal_id, m.kind, m.due_at
     from milestones m
     where m.completed_at is null and m.due_at <= now() + interval '24 hours'
     order by m.due_at asc
     limit 50`
  );

  let escalated = 0;
  for (const row of q.rows) {
    await pool.query(
      `insert into reminders (id, milestone_id, channel, state)
       values ($1, $2, $3, $4)`,
      [id(), row.id, 'signal', 'pending']
    );
    escalated++;
  }

  return { ok: true, processed: q.rowCount, escalated };
});

app.post('/api/stripe/webhook', { config: { rawBody: true } }, async (req, reply) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return reply.code(200).send({ ok: true, skipped: true, reason: 'stripe-not-configured' });
  }

  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);

    if (pool && event.type.startsWith('customer.subscription.')) {
      const sub = event.data.object;
      await pool.query(
        `insert into subscriptions (id, client_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
         values ($1, null, $2, $3, $4, to_timestamp($5))
         on conflict (stripe_subscription_id)
         do update set status = excluded.status, current_period_end = excluded.current_period_end`,
        [id(), sub.customer?.toString(), sub.id, sub.status, sub.current_period_end || 0]
      );
    }

    return reply.code(200).send({ ok: true, received: true, type: event.type });
  } catch (err) {
    req.log.error(err);
    return reply.code(400).send({ ok: false, error: 'Invalid Stripe webhook signature' });
  }
});

app.listen({ host: '0.0.0.0', port })
  .then(() => app.log.info(`DealOS backend listening on ${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
