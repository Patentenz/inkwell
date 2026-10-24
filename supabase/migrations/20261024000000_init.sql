create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled document' check (char_length(title) between 1 and 200),
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_shares (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

create index documents_owner_id_idx on public.documents(owner_id);
create index document_shares_user_id_idx on public.document_shares(user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;