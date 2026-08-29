create extension if not exists "pgcrypto";

create table if not exists public.typing_attempts (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  nickname_key text not null unique,
  prompt_id integer not null,
  prompt text not null,
  typed_text text,
  duration_ms integer,
  cpm integer,
  accuracy numeric(5, 1),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint valid_completed_attempt check (
    status = 'active'
    or (
      typed_text is not null
      and duration_ms is not null
      and cpm is not null
      and accuracy is not null
      and completed_at is not null
    )
  )
);

create index if not exists typing_attempts_leaderboard_idx
  on public.typing_attempts (cpm desc, accuracy desc, completed_at asc)
  where status = 'completed';

alter table public.typing_attempts enable row level security;

-- 브라우저에는 service role 키를 노출하지 않습니다.
-- 모든 읽기/쓰기는 Next.js 서버 API를 통해서만 수행합니다.

