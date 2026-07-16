import {
  createRule,
  deleteRule,
  updateRule,
} from "./actions";
import { requireStaff } from "@/lib/auth/require-staff";

type Condition = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type Symptom = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type Rule = {
  id: string;
  condition_id: string;
  symptom_id: string;
  expert_weight: number | string;
  is_required: boolean;
  minimum_duration_days: number | null;
  conditions: Condition;
  symptoms: Symptom;
};

type RulesPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Kelola Aturan",
};

export default async function RulesPage({
  searchParams,
}: RulesPageProps) {
  const params = await searchParams;
  const { supabase, profile } = await requireStaff();

  const [
    conditionsResult,
    symptomsResult,
    rulesResult,
  ] = await Promise.all([
    supabase
      .from("conditions")
      .select("id, code, name, is_active")
      .order("code"),

    supabase
      .from("symptoms")
      .select("id, code, name, is_active")
      .eq("is_crisis", false)
      .order("display_order"),

    supabase
      .from("rules")
      .select(`
        id,
        condition_id,
        symptom_id,
        expert_weight,
        is_required,
        minimum_duration_days,
        conditions (
          id,
          code,
          name,
          is_active
        ),
        symptoms (
          id,
          code,
          name,
          is_active
        )
      `)
      .order("condition_id"),
  ]);

  if (conditionsResult.error) {
    throw new Error(
      conditionsResult.error.message,
    );
  }

  if (symptomsResult.error) {
    throw new Error(
      symptomsResult.error.message,
    );
  }

  if (rulesResult.error) {
    throw new Error(rulesResult.error.message);
  }

  const conditions =
    (conditionsResult.data ?? []) as Condition[];

  const symptoms =
    (symptomsResult.data ?? []) as Symptom[];

  const rules =
    (rulesResult.data ?? []) as unknown as Rule[];

  return (
    <div>
      <span className="text-sm font-semibold text-[#146b58]">
        Mesin inferensi
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
        Aturan dan bobot pakar
      </h1>

      <p className="mt-3 text-slate-600">
        Hubungkan kondisi dengan gejala dan tentukan tingkat
        keyakinan pakar.
      </p>

      {params.message && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {params.message}
        </div>
      )}

      {params.error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {params.error}
        </div>
      )}

      <section className="mt-7 rounded-xl border border-[#dfe6e2] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">
          Tambah aturan
        </h2>

        <RuleForm
          action={createRule}
          conditions={conditions}
          symptoms={symptoms}
        />
      </section>

      <section className="mt-7 space-y-4">
        {rules.map((rule) => (
          <article
            key={rule.id}
            className="rounded-xl border border-[#dfe6e2] bg-white p-5 sm:p-7"
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {rule.conditions.code} —{" "}
                  {rule.conditions.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {rule.symptoms.code} —{" "}
                  {rule.symptoms.name}
                </p>
              </div>

              <span className="rounded-full bg-[#e5f3ed] px-3 py-1 text-sm font-semibold text-[#0c5142]">
                CF {Number(rule.expert_weight).toFixed(2)}
              </span>
            </div>

            <RuleForm
              action={updateRule}
              conditions={conditions}
              symptoms={symptoms}
              rule={rule}
            />

            {profile.role === "admin" && (
              <form
                action={deleteRule}
                className="mt-5 border-t border-[#dfe6e2] pt-5"
              >
                <input
                  type="hidden"
                  name="id"
                  value={rule.id}
                />

                <button
                  type="submit"
                  className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Hapus aturan
                </button>
              </form>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function RuleForm({
  action,
  conditions,
  symptoms,
  rule,
}: {
  action: (formData: FormData) => Promise<void>;
  conditions: Condition[];
  symptoms: Symptom[];
  rule?: Rule;
}) {
  return (
    <form action={action} className="mt-5 grid gap-5">
      {rule && (
        <input
          type="hidden"
          name="id"
          value={rule.id}
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm font-semibold">
            Kondisi
          </span>

          <select
            name="conditionId"
            required
            defaultValue={rule?.condition_id ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] bg-white px-4"
          >
            <option value="" disabled>
              Pilih kondisi
            </option>

            {conditions.map((condition) => (
              <option
                key={condition.id}
                value={condition.id}
              >
                {condition.code} — {condition.name}
                {!condition.is_active
                  ? " (Tidak aktif)"
                  : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold">
            Gejala
          </span>

          <select
            name="symptomId"
            required
            defaultValue={rule?.symptom_id ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] bg-white px-4"
          >
            <option value="" disabled>
              Pilih gejala
            </option>

            {symptoms.map((symptom) => (
              <option
                key={symptom.id}
                value={symptom.id}
              >
                {symptom.code} — {symptom.name}
                {!symptom.is_active
                  ? " (Tidak aktif)"
                  : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm font-semibold">
            Bobot pakar
          </span>

          <input
            name="expertWeight"
            type="number"
            required
            min="0.01"
            max="1"
            step="0.01"
            defaultValue={
              rule
                ? Number(rule.expert_weight)
                : 0.5
            }
            className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
          />

          <span className="mt-2 block text-xs text-slate-500">
            Nilai antara 0.01 dan 1.
          </span>
        </label>

        <label>
          <span className="text-sm font-semibold">
            Durasi minimal
          </span>

          <input
            name="minimumDurationDays"
            type="number"
            min="0"
            max="3650"
            defaultValue={
              rule?.minimum_duration_days ?? ""
            }
            placeholder="Contoh: 14"
            className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
          />

          <span className="mt-2 block text-xs text-slate-500">
            Kosongkan jika durasi tidak digunakan.
          </span>
        </label>
      </div>

      <label className="flex items-center gap-3">
        <input
          name="isRequired"
          type="checkbox"
          defaultChecked={
            rule?.is_required ?? false
          }
          className="size-5 accent-[#146b58]"
        />

        <span className="text-sm font-semibold">
          Gejala wajib untuk kondisi ini
        </span>
      </label>

      <button
        type="submit"
        className="min-h-12 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142] sm:w-fit"
      >
        {rule
          ? "Simpan perubahan"
          : "Tambah aturan"}
      </button>
    </form>
  );
}