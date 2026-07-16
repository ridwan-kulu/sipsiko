import {
  createCondition,
  deleteCondition,
  updateCondition,
} from "./actions";
import { requireStaff } from "@/lib/auth/require-staff";

type ConditionsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type Condition = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  recommendation: string;
  is_active: boolean;
};

export const metadata = {
  title: "Kelola Kondisi",
};

export default async function ConditionsPage({
  searchParams,
}: ConditionsPageProps) {
  const params = await searchParams;
  const { supabase, profile } = await requireStaff();

  const { data, error } = await supabase
    .from("conditions")
    .select(`
      id,
      code,
      name,
      slug,
      description,
      recommendation,
      is_active
    `)
    .order("code");

  if (error) {
    throw new Error(error.message);
  }

  const conditions = (data ?? []) as Condition[];

  return (
    <div>
      <span className="text-sm font-semibold text-[#146b58]">
        Basis pengetahuan
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
        Kelola kondisi
      </h1>

      <p className="mt-3 text-slate-600">
        Tambahkan dan perbarui kondisi yang digunakan mesin
        inferensi.
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
          Tambah kondisi
        </h2>

        <ConditionForm action={createCondition} />
      </section>

      <section className="mt-7 space-y-4">
        {conditions.map((condition) => (
          <article
            key={condition.id}
            className="rounded-xl border border-[#dfe6e2] bg-white p-5 sm:p-7"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs text-slate-500">
                  {condition.code}
                </span>

                <h2 className="mt-1 text-lg font-semibold">
                  {condition.name}
                </h2>
              </div>

              <span
                className={
                  condition.is_active
                    ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                }
              >
                {condition.is_active
                  ? "Aktif"
                  : "Tidak aktif"}
              </span>
            </div>

            <ConditionForm
              action={updateCondition}
              condition={condition}
            />

            {profile.role === "admin" && (
              <form
                action={deleteCondition}
                className="mt-5 border-t border-[#dfe6e2] pt-5"
              >
                <input
                  type="hidden"
                  name="id"
                  value={condition.id}
                />

                <button
                  type="submit"
                  className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Hapus kondisi
                </button>
              </form>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function ConditionForm({
  action,
  condition,
}: {
  action: (formData: FormData) => Promise<void>;
  condition?: Condition;
}) {
  return (
    <form action={action} className="mt-5 grid gap-5">
      {condition && (
        <input
          type="hidden"
          name="id"
          value={condition.id}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Kode"
          name="code"
          defaultValue={condition?.code}
          placeholder="P001"
        />

        <Field
          label="Slug"
          name="slug"
          defaultValue={condition?.slug}
          placeholder="indikasi-gejala-depresi"
        />
      </div>

      <Field
        label="Nama"
        name="name"
        defaultValue={condition?.name}
        placeholder="Indikasi Gejala Depresi"
      />

      <Textarea
        label="Deskripsi"
        name="description"
        defaultValue={condition?.description}
      />

      <Textarea
        label="Rekomendasi"
        name="recommendation"
        defaultValue={condition?.recommendation}
      />

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={
            condition?.is_active ?? true
          }
          className="size-5 accent-[#146b58]"
        />

        <span className="text-sm font-semibold">
          Kondisi aktif
        </span>
      </label>

      <button
        type="submit"
        className="min-h-12 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142] sm:w-fit"
      >
        {condition
          ? "Simpan perubahan"
          : "Tambah kondisi"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">
        {label}
      </span>

      <textarea
        name={name}
        required
        rows={4}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-[#dfe6e2] px-4 py-3"
      />
    </label>
  );
}