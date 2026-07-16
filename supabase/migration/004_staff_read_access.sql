create policy "staff can read all conditions"
on public.conditions
for select
to authenticated
using ((select public.is_staff()));

create policy "staff can read all symptoms"
on public.symptoms
for select
to authenticated
using ((select public.is_staff()));

create policy "staff can read all rules"
on public.rules
for select
to authenticated
using ((select public.is_staff()));

create policy "staff can read profiles"
on public.profiles
for select
to authenticated
using ((select public.is_staff()));