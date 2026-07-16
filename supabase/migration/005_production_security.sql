-- Hapus kebijakan baca aturan untuk publik.
drop policy if exists "rules are readable"
on public.rules;

drop policy if exists "public read rules"
on public.rules;

drop policy if exists "active rules are readable"
on public.rules;

-- Staf tetap dapat membaca aturan melalui policy
-- "staff can read all rules" dari migration sebelumnya.