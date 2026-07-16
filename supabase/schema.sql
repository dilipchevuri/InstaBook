-- Run this once in Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  date date not null,
  title text not null,
  content_json jsonb, -- structured digest: { sections: [{ category, items: [{id,title,summary,points,mainsAngle}] }], quickRecall }
  content_md text, -- plain-text flattened fallback (search, meta descriptions)
  sources jsonb,
  translations jsonb default '{}'::jsonb, -- cached translations, e.g. { "te": {...same shape as content_json}, "hi": {...} }
  created_at timestamptz default now()
);

-- If you already ran an earlier version of this schema, run these once to add new columns:
-- alter table notes add column if not exists content_json jsonb;
-- alter table notes add column if not exists translations jsonb default '{}'::jsonb;
-- alter table capsules add column if not exists translations jsonb default '{}'::jsonb;

create table if not exists capsules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- same date-based slug pattern as notes, e.g. '2026-07-08'
  date date not null,
  content_json jsonb not null, -- { capsules: [{ id, subject, topic, points, pyqNote, currentNote, question }] }
  translations jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table capsules enable row level security;
create policy "public read capsules" on capsules for select using (true);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  slug text unique not null,
  date date not null,
  questions jsonb not null,
  created_at timestamptz default now()
);

create table if not exists run_logs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  status text not null, -- 'success' | 'partial' | 'failed'
  details jsonb,
  created_at timestamptz default now()
);

-- Row Level Security: allow public read-only access, block writes from the browser.
alter table notes enable row level security;
alter table quizzes enable row level security;
alter table run_logs enable row level security;

create policy "public read notes" on notes for select using (true);
create policy "public read quizzes" on quizzes for select using (true);
-- run_logs stays admin-only (no public policy) since it's just for your debugging.

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  score int not null,
  total int not null,
  answers jsonb,
  created_at timestamptz default now()
);
alter table quiz_attempts enable row level security;
-- No public policy on quiz_attempts either — only the server (service_role) writes/reads it.

-- Writes only happen from the server using the service_role key, which bypasses RLS,
-- so no insert/update policies are needed for the anon/public role.
