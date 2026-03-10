create schema if not exists archive;

revoke all on schema archive from public;
revoke all on schema archive from anon;
revoke all on schema archive from authenticated;

alter default privileges in schema archive revoke all on tables from public;
alter default privileges in schema archive revoke all on tables from anon;
alter default privileges in schema archive revoke all on tables from authenticated;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'courses_backup_20251031'
  ) then
    alter table public.courses_backup_20251031 set schema archive;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'academic_profiles_backup_20251031'
  ) then
    alter table public.academic_profiles_backup_20251031 set schema archive;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles_backup_20251031'
  ) then
    alter table public.profiles_backup_20251031 set schema archive;
  end if;
end;
$$;

revoke all on all tables in schema archive from public;
revoke all on all tables in schema archive from anon;
revoke all on all tables in schema archive from authenticated;

alter table public.courses
  add column if not exists orientations text[] not null default '{}'::text[];

update public.courses
set orientations = '{}'::text[]
where orientations is null;

create index if not exists idx_courses_orientations
  on public.courses
  using gin (orientations);

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Users can read own profile."
  on public.profiles
  for select
  to authenticated
  using (((select auth.uid()) is not null) and ((select auth.uid()) = id));

create policy "Users can insert their own profile."
  on public.profiles
  for insert
  to authenticated
  with check (((select auth.uid()) is not null) and ((select auth.uid()) = id));

create policy "Users can update own profile."
  on public.profiles
  for update
  to authenticated
  using (((select auth.uid()) is not null) and ((select auth.uid()) = id))
  with check (((select auth.uid()) is not null) and ((select auth.uid()) = id));

drop trigger if exists update_profiles_updated_at on public.profiles;

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

drop function if exists public.get_related_courses(text, integer);

create function public.get_related_courses(
  p_course_id text,
  p_limit integer default 6
)
returns table(
  id text,
  name text,
  programs text[],
  orientations text[],
  huvudomrade text,
  examinator text,
  studierektor text,
  credits numeric,
  level text,
  term text[],
  period text[],
  block text[],
  pace numeric,
  examination text[],
  campus text,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  relevance_score integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_programs text[];
  v_level text;
  v_huvudomrade text;
  v_campus text;
begin
  select c.programs, c.level, c.huvudomrade, c.campus
  into v_programs, v_level, v_huvudomrade, v_campus
  from public.courses c
  where c.id = p_course_id;

  if not found then
    return;
  end if;

  return query
  with candidate_courses as (
    select
      c.*,
      (
        select count(*)::integer
        from unnest(c.programs) cp
        join unnest(v_programs) vp on cp = vp
      ) as program_overlap_count
    from public.courses c
    where c.id != p_course_id
      and (
        c.programs && v_programs
        or (c.huvudomrade = v_huvudomrade and c.huvudomrade is not null)
      )
  )
  select
    cc.id,
    cc.name,
    cc.programs,
    cc.orientations,
    cc.huvudomrade,
    cc.examinator,
    cc.studierektor,
    cc.credits,
    cc.level,
    cc.term,
    cc.period,
    cc.block,
    cc.pace,
    cc.examination,
    cc.campus,
    cc.notes,
    cc.created_at,
    cc.updated_at,
    (
      cc.program_overlap_count * 10
      + case
          when cc.huvudomrade = v_huvudomrade and cc.huvudomrade is not null then 15
          else 0
        end
      + case when cc.level = v_level then 5 else 0 end
      + case when cc.level != v_level then 2 else 0 end
      + case when cc.campus = v_campus then 1 else 0 end
    )::integer as relevance_score
  from candidate_courses cc
  where (
    cc.program_overlap_count > 0
    or (cc.huvudomrade = v_huvudomrade and cc.huvudomrade is not null)
  )
  order by relevance_score desc, cc.id asc
  limit p_limit;
end;
$function$;

create or replace function public.import_course_data(course_json jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  insert into public.courses (
    id,
    name,
    credits,
    level,
    term,
    period,
    block,
    pace,
    examination,
    campus,
    programs,
    orientations,
    notes
  )
  values (
    course_json->>'id',
    course_json->>'name',
    (course_json->>'credits')::integer,
    course_json->>'level',
    array(select jsonb_array_elements_text(course_json->'term')),
    array(select jsonb_array_elements_text(course_json->'period')),
    array(select jsonb_array_elements_text(course_json->'block')),
    course_json->>'pace',
    array(select jsonb_array_elements_text(course_json->'examination')),
    course_json->>'campus',
    array(select jsonb_array_elements_text(course_json->'programs')),
    array(
      select jsonb_array_elements_text(
        coalesce(course_json->'orientations', '[]'::jsonb)
      )
    ),
    coalesce(course_json->>'notes', '')
  )
  on conflict (id) do update
  set
    name = excluded.name,
    credits = excluded.credits,
    level = excluded.level,
    term = excluded.term,
    period = excluded.period,
    block = excluded.block,
    pace = excluded.pace,
    examination = excluded.examination,
    campus = excluded.campus,
    programs = excluded.programs,
    orientations = excluded.orientations,
    notes = excluded.notes,
    updated_at = now();
end;
$function$;

revoke execute on function public.cleanup_old_profiles(integer) from public;
revoke execute on function public.cleanup_old_profiles(integer) from anon;
revoke execute on function public.cleanup_old_profiles(integer) from authenticated;
grant execute on function public.cleanup_old_profiles(integer) to service_role;

revoke execute on function public.get_email_from_username(text) from public;
revoke execute on function public.get_email_from_username(text) from anon;
revoke execute on function public.get_email_from_username(text) from authenticated;
grant execute on function public.get_email_from_username(text) to service_role;

revoke execute on function public.get_profile_stats(uuid) from public;
revoke execute on function public.get_profile_stats(uuid) from anon;
revoke execute on function public.get_profile_stats(uuid) from authenticated;
grant execute on function public.get_profile_stats(uuid) to service_role;

revoke execute on function public.import_course_data(jsonb) from public;
revoke execute on function public.import_course_data(jsonb) from anon;
revoke execute on function public.import_course_data(jsonb) from authenticated;
grant execute on function public.import_course_data(jsonb) to service_role;

revoke execute on function public.get_related_courses(text, integer) from public;
grant execute on function public.get_related_courses(text, integer) to anon;
grant execute on function public.get_related_courses(text, integer) to authenticated;
grant execute on function public.get_related_courses(text, integer) to service_role;
