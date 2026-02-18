import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/api/health', async () => {
  return { ok: true, service: 'dealos-backend', ts: new Date().toISOString() };
});

app.post('/api/intake', async (req, reply) => {
  const body = req.body || {};
  // TODO: persist to Postgres
  return reply.code(201).send({ ok: true, stage: 'intake-received', payload: body });
});

app.post('/api/leads', async (req, reply) => {
  const body = req.body || {};
  // TODO: score + store lead
  return reply.code(201).send({ ok: true, stage: 'lead-created', payload: body });
});

app.post('/api/deals/:id/events', async (req, reply) => {
  const { id } = req.params;
  const body = req.body || {};
  // TODO: store milestone/deal event
  return { ok: true, dealId: id, event: body };
});

app.post('/api/escalations/run', async () => {
  // TODO: run nudge -> hard alarm rules for due milestones
  return { ok: true, processed: 0, escalated: 0 };
});

app.post('/api/stripe/webhook', async (req, reply) => {
  // TODO: verify webhook signature and sync subscription state
  const event = req.body || {};
  return reply.code(200).send({ ok: true, received: true, type: event?.type || 'unknown' });
});

const port = Number(process.env.PORT || 8787);
app.listen({ host: '0.0.0.0', port })
  .then(() => app.log.info(`DealOS backend listening on ${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });