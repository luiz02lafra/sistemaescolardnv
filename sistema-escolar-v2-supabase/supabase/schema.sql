-- Execute uma vez no Supabase: SQL Editor > New query.
create type public.school_role as enum ('aluno', 'professor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.school_role not null default 'aluno',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create policy "profile: ler o próprio" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profile: administrador atualiza" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Cada nova inscrição pública começa como aluno; a API administrativa pode definir outro papel.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'aluno')
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Núcleo acadêmico: cursos, turmas, matrículas, atividades, notas e presença.
create table public.courses (id uuid primary key default gen_random_uuid(), name text not null, description text, active boolean not null default true, created_at timestamptz not null default now());
create table public.classes (id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete restrict, teacher_id uuid references public.profiles(id) on delete set null, name text not null, school_year integer not null, active boolean not null default true, created_at timestamptz not null default now());
create table public.enrollments (id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique(class_id, student_id));
create table public.assignments (id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade, title text not null, instructions text, due_at timestamptz, created_at timestamptz not null default now());
create table public.grades (id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references public.enrollments(id) on delete cascade, assignment_id uuid references public.assignments(id) on delete set null, score numeric(5,2) check(score >= 0 and score <= 10), feedback text, created_at timestamptz not null default now(), unique(enrollment_id, assignment_id));
create table public.attendance (id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade, class_date date not null, present boolean not null default true, note text, unique(class_id, student_id, class_date));

create or replace function public.is_teacher_for_class(target_class uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.classes where id = target_class and teacher_id = auth.uid()) $$;

alter table public.courses enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.grades enable row level security;
alter table public.attendance enable row level security;

create policy "courses: leitura autenticada" on public.courses for select to authenticated using (true);
create policy "courses: gestão admin" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "classes: ver envolvidas" on public.classes for select to authenticated using (public.is_admin() or teacher_id = auth.uid() or exists(select 1 from public.enrollments where class_id = classes.id and student_id = auth.uid()));
create policy "classes: gestão admin" on public.classes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "enrollments: ver próprias" on public.enrollments for select to authenticated using (public.is_admin() or student_id = auth.uid() or public.is_teacher_for_class(class_id));
create policy "enrollments: gestão admin" on public.enrollments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "assignments: ver turma" on public.assignments for select to authenticated using (public.is_admin() or public.is_teacher_for_class(class_id) or exists(select 1 from public.enrollments where class_id = assignments.class_id and student_id = auth.uid()));
create policy "assignments: professor cria" on public.assignments for insert to authenticated with check (public.is_admin() or public.is_teacher_for_class(class_id));
create policy "assignments: professor altera" on public.assignments for update to authenticated using (public.is_admin() or public.is_teacher_for_class(class_id)) with check (public.is_admin() or public.is_teacher_for_class(class_id));
create policy "grades: ver próprias" on public.grades for select to authenticated using (public.is_admin() or exists(select 1 from public.enrollments e where e.id = grades.enrollment_id and (e.student_id = auth.uid() or public.is_teacher_for_class(e.class_id))));
create policy "grades: professor registra" on public.grades for all to authenticated using (public.is_admin() or exists(select 1 from public.enrollments e where e.id = grades.enrollment_id and public.is_teacher_for_class(e.class_id))) with check (public.is_admin() or exists(select 1 from public.enrollments e where e.id = grades.enrollment_id and public.is_teacher_for_class(e.class_id)));
create policy "attendance: ver própria" on public.attendance for select to authenticated using (public.is_admin() or student_id = auth.uid() or public.is_teacher_for_class(class_id));
create policy "attendance: professor registra" on public.attendance for all to authenticated using (public.is_admin() or public.is_teacher_for_class(class_id)) with check (public.is_admin() or public.is_teacher_for_class(class_id));
