-- DealOS MVP schema (Postgres)

create table if not exists accounts (
  id uuid primary key,
  email text not null unique,
  role text not null default 'client',
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key,
  account_id uuid references accounts(id),
  brokerage_name text,
  market text,
  plan text not null,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key,
  client_id uuid references clients(id),
  full_name text,
  source text,
  intent text,
  stage text,
  score int,
  next_action_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists deals (
  id uuid primary key,
  client_id uuid references clients(id),
  lead_id uuid references leads(id),
  property_address text,
  status text,
  close_date date,
  created_at timestamptz not null default now()
);

create table if not exists milestones (
  id uuid primary key,
  deal_id uuid references deals(id),
  kind text not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  risk_level text default 'normal',
  created_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key,
  milestone_id uuid references milestones(id),
  channel text not null,
  state text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key,
  client_id uuid references clients(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);