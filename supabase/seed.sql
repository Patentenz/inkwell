insert into public.users (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Alice', 'alice@inkwell.test'),
  ('22222222-2222-2222-2222-222222222222', 'Bob', 'bob@inkwell.test'),
  ('33333333-3333-3333-3333-333333333333', 'Charlie', 'charlie@inkwell.test')
on conflict (id) do nothing;

insert into public.documents (id, owner_id, title, content) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Welcome to Inkwell',
  '{"type":"doc","content":[
    {"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Welcome to Inkwell"}]},
    {"type":"paragraph","content":[{"type":"text","text":"This sample document is owned by Alice and shared with Bob as an editor."}]},
    {"type":"bulletList","content":[
      {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Bold"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"italic"}],"text":"italic"},{"type":"text","text":" and lists are supported."}]}]}
    ]}
  ]}'::jsonb
) on conflict (id) do nothing;

insert into public.document_shares (document_id, user_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'editor')
on conflict do nothing;

select u.name, d.title, s.role
from public.document_shares s
join public.users u on u.id = s.user_id
join public.documents d on d.id = s.document_id;