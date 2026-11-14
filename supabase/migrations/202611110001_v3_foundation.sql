begin;
create extension if not exists pgcrypto with schema extensions;
create schema private;
create type public.app_role as enum ('STUDENT','STAFF','ADMIN');
create type public.membership_status as enum ('INVITED','ACTIVE','SUSPENDED','REMOVED');
create type public.profile_status as enum ('SETUP','STAFF_ASSIGNED','INVITED','DRAFT','SUBMITTED','NEEDS_REVISION','APPROVED','PUBLISHED','INACTIVE');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  timezone text not null,
  website_url text check (website_url is null or website_url ~ '^https://'),
  is_active boolean not null default true,
  staff_can_create boolean not null default false,
  staff_can_publish boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role public.app_role not null, status public.membership_status not null default 'INVITED',
  joined_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(school_id,user_id),
  check (status <> 'ACTIVE' or joined_at is not null)
);
create table public.academic_years (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id),
  label text not null, starts_on date not null, ends_on date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(school_id,id), unique(school_id,label), check(ends_on > starts_on)
);
create unique index academic_years_one_current on public.academic_years(school_id) where is_current;
create table public.activity_types (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id),
  code text not null check(code ~ '^[A-Z][A-Z0-9_]+$'), name text not null,
  description text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(school_id,id), unique(school_id,code)
);
create table public.activities (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id),
  activity_type_id uuid not null, slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  official_name text not null check(char_length(official_name) between 2 and 160),
  short_name text, is_active boolean not null default true,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(school_id,id), unique(school_id,slug),
  foreign key(school_id,activity_type_id) references public.activity_types(school_id,id)
);
create table public.activity_profiles (
  id uuid primary key default gen_random_uuid(), school_id uuid not null,
  activity_id uuid not null, academic_year_id uuid not null,
  status public.profile_status not null default 'DRAFT',
  short_description text check(short_description is null or char_length(short_description) <= 500),
  published_at timestamptz, last_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(school_id,id), unique(activity_id,academic_year_id),
  foreign key(school_id,activity_id) references public.activities(school_id,id) on delete cascade,
  foreign key(school_id,academic_year_id) references public.academic_years(school_id,id),
  check(status <> 'PUBLISHED' or published_at is not null)
);
create table public.activity_staff (
  school_id uuid not null, activity_id uuid not null, user_id uuid not null,
  is_primary boolean not null default false, title text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(school_id,activity_id,user_id),
  foreign key(school_id,activity_id) references public.activities(school_id,id) on delete cascade,
  foreign key(school_id,user_id) references public.school_memberships(school_id,user_id) on delete cascade
);
create index membership_user_status on public.school_memberships(user_id,status);
create index profile_school_year_status on public.activity_profiles(school_id,academic_year_id,status);
create index assignment_user_school on public.activity_staff(user_id,school_id);

create function private.has_role(target_school uuid, allowed public.app_role[])
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.school_memberships m join public.schools s on s.id=m.school_id
 where m.school_id=target_school and m.user_id=auth.uid() and m.status='ACTIVE' and m.role=any(allowed) and s.is_active);
$$;
create function private.assigned_staff(target_school uuid, target_activity uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role(target_school,array['STAFF']::public.app_role[]) and exists(
 select 1 from public.activity_staff a where a.school_id=target_school and a.activity_id=target_activity and a.user_id=auth.uid());
$$;
create function private.can_edit_activity(target_school uuid, target_activity uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role(target_school,array['ADMIN']::public.app_role[]) or private.assigned_staff(target_school,target_activity);
$$;
create function private.current_year(target_school uuid, target_year uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.academic_years y where y.school_id=target_school and y.id=target_year and y.is_current);
$$;
create function private.can_read_activity(target_school uuid, target_activity uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role(target_school,array['STUDENT','STAFF','ADMIN']::public.app_role[]) and exists(
 select 1 from public.activities a where a.id=target_activity and a.school_id=target_school and (
 private.can_edit_activity(target_school,target_activity) or
 (a.is_active and exists(select 1 from public.activity_profiles p join public.academic_years y
 on y.id=p.academic_year_id and y.school_id=p.school_id
 where p.activity_id=a.id and p.school_id=a.school_id and p.status='PUBLISHED' and y.is_current))));
$$;

create function private.timestamps() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end;
$$;
create function private.immutable_school() returns trigger language plpgsql set search_path='' as $$
begin
 if new.school_id is distinct from old.school_id then raise exception 'School ownership cannot change' using errcode='23514'; end if;
 return new;
end;
$$;
create function private.validate_school_timezone() returns trigger language plpgsql set search_path='' as $$
begin
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then
 raise exception 'A valid IANA timezone is required' using errcode='23514'; end if;
 return new;
end;
$$;
create function private.validate_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.school_memberships m where m.school_id=new.school_id and m.user_id=new.user_id
 and m.status='ACTIVE' and m.role in ('STAFF','ADMIN')) then
 raise exception 'An assignment requires active staff membership in the same school' using errcode='23514'; end if;
 return new;
end;
$$;
create function private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.user_profiles(id,display_name) values(new.id,left(nullif(trim(new.raw_user_meta_data->>'display_name'),''),100));
 return new;
end;
$$;
create trigger auth_user_profile after insert on auth.users for each row execute function private.new_profile();
create trigger school_timezone before insert or update of timezone on public.schools for each row execute function private.validate_school_timezone();
create trigger assignment_role before insert or update on public.activity_staff for each row execute function private.validate_assignment();
do $$
declare t text;
begin
 foreach t in array array['user_profiles','schools','school_memberships','academic_years','activity_types','activities','activity_profiles','activity_staff'] loop
 execute format('create trigger update_timestamp before update on public.%I for each row execute function private.timestamps()',t);
 execute format('alter table public.%I enable row level security',t);
 end loop;
 foreach t in array array['school_memberships','academic_years','activity_types','activities','activity_profiles','activity_staff'] loop
 execute format('create trigger immutable_school before update on public.%I for each row execute function private.immutable_school()',t);
 end loop;
end $$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.has_role(uuid,public.app_role[]),
 private.assigned_staff(uuid,uuid),private.can_edit_activity(uuid,uuid),
 private.current_year(uuid,uuid),private.can_read_activity(uuid,uuid) to authenticated;
-- Remove implicit grants, then open only the explicitly tested operations.
revoke all on public.user_profiles,public.schools,public.school_memberships,public.academic_years,
 public.activity_types,public.activities,public.activity_profiles,public.activity_staff from anon,authenticated;
grant select on public.user_profiles,public.schools,public.school_memberships,public.academic_years,
 public.activity_types,public.activities,public.activity_profiles,public.activity_staff to authenticated;
grant update(display_name) on public.user_profiles to authenticated;
grant update(official_name) on public.activities to authenticated;
grant update(short_description) on public.activity_profiles to authenticated;

create policy own_profile_read on public.user_profiles for select to authenticated using(id=auth.uid());
create policy own_profile_update on public.user_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy member_school on public.schools for select to authenticated
 using(private.has_role(id,array['STUDENT','STAFF','ADMIN']::public.app_role[]));
create policy membership_read on public.school_memberships for select to authenticated
 using(user_id=auth.uid() or private.has_role(school_id,array['ADMIN']::public.app_role[]));
create policy year_read on public.academic_years for select to authenticated
 using(private.has_role(school_id,array['STUDENT','STAFF','ADMIN']::public.app_role[]));
create policy type_read on public.activity_types for select to authenticated
 using(private.has_role(school_id,array['STUDENT','STAFF','ADMIN']::public.app_role[]));
create policy activity_read on public.activities for select to authenticated using(private.can_read_activity(school_id,id));
create policy activity_edit on public.activities for update to authenticated
 using(private.can_edit_activity(school_id,id)) with check(private.can_edit_activity(school_id,id));
create policy profile_read on public.activity_profiles for select to authenticated using(
 private.can_read_activity(school_id,activity_id) and (
 private.can_edit_activity(school_id,activity_id) or (status='PUBLISHED' and private.current_year(school_id,academic_year_id))));
create policy profile_edit on public.activity_profiles for update to authenticated
 using(private.can_edit_activity(school_id,activity_id)) with check(private.can_edit_activity(school_id,activity_id));
create policy assignment_read on public.activity_staff for select to authenticated using(
 private.has_role(school_id,array['ADMIN']::public.app_role[]) or
 (user_id=auth.uid() and private.has_role(school_id,array['STAFF']::public.app_role[])));
commit;
