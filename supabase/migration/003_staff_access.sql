-- =========================================================
-- MENCEGAH PENGGUNA MENGUBAH ROLE SENDIRI
-- =========================================================

revoke update on public.profiles from authenticated;

grant update (full_name)
on public.profiles
to authenticated;

-- =========================================================
-- FUNGSI PEMERIKSAAN ROLE
-- =========================================================

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('expert', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

grant execute on function public.is_staff()
to authenticated;

grant execute on function public.is_admin()
to authenticated;

-- =========================================================
-- CONDITIONS
-- =========================================================

create policy "staff can create conditions"
on public.conditions
for insert
to authenticated
with check ((select public.is_staff()));

create policy "staff can update conditions"
on public.conditions
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "admin can delete conditions"
on public.conditions
for delete
to authenticated
using ((select public.is_admin()));

-- =========================================================
-- SYMPTOMS
-- =========================================================

create policy "staff can create symptoms"
on public.symptoms
for insert
to authenticated
with check ((select public.is_staff()));

create policy "staff can update symptoms"
on public.symptoms
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "admin can delete symptoms"
on public.symptoms
for delete
to authenticated
using ((select public.is_admin()));

-- =========================================================
-- RULES
-- =========================================================

create policy "staff can create rules"
on public.rules
for insert
to authenticated
with check ((select public.is_staff()));

create policy "staff can update rules"
on public.rules
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "admin can delete rules"
on public.rules
for delete
to authenticated
using ((select public.is_admin()));

-- =========================================================
-- AUDIT LOGS
-- =========================================================

create policy "staff can read audit logs"
on public.audit_logs
for select
to authenticated
using ((select public.is_staff()));

create or replace function public.audit_knowledge_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_id uuid;
  operation text;
begin
  if tg_op = 'INSERT' then
    record_id := new.id;
    operation := 'create';

    insert into public.audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data
    )
    values (
      auth.uid(),
      operation,
      tg_table_name,
      record_id,
      null,
      to_jsonb(new)
    );

    return new;
  end if;

  if tg_op = 'UPDATE' then
    record_id := new.id;
    operation := 'update';

    insert into public.audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data
    )
    values (
      auth.uid(),
      operation,
      tg_table_name,
      record_id,
      to_jsonb(old),
      to_jsonb(new)
    );

    return new;
  end if;

  if tg_op = 'DELETE' then
    record_id := old.id;
    operation := 'delete';

    insert into public.audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data
    )
    values (
      auth.uid(),
      operation,
      tg_table_name,
      record_id,
      to_jsonb(old),
      null
    );

    return old;
  end if;

  return null;
end;
$$;

create trigger conditions_audit
after insert or update or delete
on public.conditions
for each row
execute function public.audit_knowledge_change();

create trigger symptoms_audit
after insert or update or delete
on public.symptoms
for each row
execute function public.audit_knowledge_change();

create trigger rules_audit
after insert or update or delete
on public.rules
for each row
execute function public.audit_knowledge_change();

