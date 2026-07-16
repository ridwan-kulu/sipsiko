-- =========================================================
-- DATA DEMO
-- Wajib divalidasi tenaga kesehatan sebelum produksi.
-- =========================================================

insert into public.conditions (
  code,
  name,
  slug,
  description,
  recommendation,
  is_active
)
values
  (
    'P001',
    'Indikasi Gejala Depresi',
    'indikasi-gejala-depresi',
    'Pola gejala yang berkaitan dengan suasana hati menurun, hilangnya minat, perubahan tidur, dan kesulitan berkonsentrasi.',
    'Pertimbangkan berkonsultasi dengan psikolog, psikiater, atau tenaga kesehatan jika gejala menetap atau mengganggu aktivitas sehari-hari.',
    true
  ),
  (
    'P002',
    'Indikasi Gejala Kecemasan',
    'indikasi-gejala-kecemasan',
    'Pola gejala yang berkaitan dengan rasa cemas, kekhawatiran berlebihan, kesulitan mengendalikan kekhawatiran, dan gangguan tidur.',
    'Pertimbangkan mencatat pemicu kecemasan dan berkonsultasi dengan tenaga kesehatan jika gejala sulit dikendalikan.',
    true
  )
on conflict (code) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  recommendation = excluded.recommendation,
  is_active = excluded.is_active;

insert into public.symptoms (
  code,
  name,
  question,
  explanation,
  is_crisis,
  is_active,
  display_order
)
values
  (
    'G001',
    'Suasana hati menurun',
    'Dalam dua minggu terakhir, seberapa sering Anda merasa murung, sedih, atau kehilangan harapan?',
    'Perasaan sedih atau kehilangan harapan yang terjadi berulang.',
    false,
    true,
    1
  ),
  (
    'G002',
    'Kehilangan minat',
    'Dalam dua minggu terakhir, seberapa sering Anda kehilangan minat pada aktivitas yang biasanya dinikmati?',
    'Berkurangnya ketertarikan atau kesenangan terhadap aktivitas.',
    false,
    true,
    2
  ),
  (
    'G003',
    'Kekhawatiran berlebihan',
    'Dalam dua minggu terakhir, seberapa sering Anda merasa cemas atau khawatir secara berlebihan?',
    'Rasa khawatir yang sulit dihentikan atau tidak sebanding dengan keadaan.',
    false,
    true,
    3
  ),
  (
    'G004',
    'Sulit mengendalikan kekhawatiran',
    'Dalam dua minggu terakhir, seberapa sering Anda kesulitan mengendalikan rasa khawatir?',
    'Kesulitan mengalihkan atau menghentikan pikiran yang mengkhawatirkan.',
    false,
    true,
    4
  ),
  (
    'G005',
    'Gangguan tidur',
    'Dalam dua minggu terakhir, seberapa sering Anda kesulitan tidur, sering terbangun, atau tidur berlebihan?',
    'Perubahan pola tidur yang memengaruhi kondisi sehari-hari.',
    false,
    true,
    5
  ),
  (
    'G006',
    'Kesulitan berkonsentrasi',
    'Dalam dua minggu terakhir, seberapa sering Anda kesulitan berkonsentrasi?',
    'Kesulitan mempertahankan perhatian ketika bekerja atau melakukan aktivitas.',
    false,
    true,
    6
  ),
  (
    'G007',
    'Risiko keselamatan',
    'Apakah Anda saat ini memiliki dorongan untuk menyakiti diri sendiri atau orang lain?',
    'Pertanyaan keselamatan yang memerlukan penanganan khusus.',
    true,
    true,
    7
  )
on conflict (code) do update set
  name = excluded.name,
  question = excluded.question,
  explanation = excluded.explanation,
  is_crisis = excluded.is_crisis,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

-- Aturan indikasi gejala depresi

insert into public.rules (
  condition_id,
  symptom_id,
  expert_weight,
  is_required,
  minimum_duration_days
)
select
  conditions.id,
  symptoms.id,
  rule_data.expert_weight,
  rule_data.is_required,
  rule_data.minimum_duration_days
from (
  values
    ('P001', 'G001', 0.850::numeric, true, 14),
    ('P001', 'G002', 0.900::numeric, true, 14),
    ('P001', 'G005', 0.650::numeric, false, 14),
    ('P001', 'G006', 0.600::numeric, false, 14)
) as rule_data(
  condition_code,
  symptom_code,
  expert_weight,
  is_required,
  minimum_duration_days
)
join public.conditions
  on conditions.code = rule_data.condition_code
join public.symptoms
  on symptoms.code = rule_data.symptom_code
on conflict (condition_id, symptom_id) do update set
  expert_weight = excluded.expert_weight,
  is_required = excluded.is_required,
  minimum_duration_days = excluded.minimum_duration_days;

-- Aturan indikasi gejala kecemasan

insert into public.rules (
  condition_id,
  symptom_id,
  expert_weight,
  is_required,
  minimum_duration_days
)
select
  conditions.id,
  symptoms.id,
  rule_data.expert_weight,
  rule_data.is_required,
  rule_data.minimum_duration_days
from (
  values
    ('P002', 'G003', 0.900::numeric, true, 14),
    ('P002', 'G004', 0.850::numeric, true, 14),
    ('P002', 'G005', 0.600::numeric, false, 14),
    ('P002', 'G006', 0.550::numeric, false, 14)
) as rule_data(
  condition_code,
  symptom_code,
  expert_weight,
  is_required,
  minimum_duration_days
)
join public.conditions
  on conditions.code = rule_data.condition_code
join public.symptoms
  on symptoms.code = rule_data.symptom_code
on conflict (condition_id, symptom_id) do update set
  expert_weight = excluded.expert_weight,
  is_required = excluded.is_required,
  minimum_duration_days = excluded.minimum_duration_days;

