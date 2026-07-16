import {
  createSymptom,
  deleteSymptom,
  updateSymptom,
} from "./actions";
import { requireStaff } from "@/lib/auth/require-staff";

type Symptom = {
  id: string;
  code: string;
  name: string;
  question: string;
  explanation: string | null;
  display_order: number;
  is_crisis: boolean;
  is_active: boolean;
};

type SymptomsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Kelola Gejala",
};

export default async function SymptomsPage({
  searchParams,
}: SymptomsPageProps) {
  const params = await searchParams;
  const { supabase, profile } = await requireStaff();

  const { data, error } = await supabase
    .from("symptoms")
    .select(`
      id,
      code,
      name,
      question,
      explanation,
      display_order,
      is_crisis,
      is_active
    `)
    .order("display_order");

  if (error) {
    throw new Error(error.message);
  }

  const symptoms = (data ?? []) as Symptom[];

  return (
    <div>
      <span className="text-sm font-semibold text-[#146b58]">
        Basis pengetahuan
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
        Kelola gejala
      </h1>

      <p className="mt-3 text-slate-600">
        Kelola pertanyaan yang ditampilkan dalam alur skrining.
      </p>

      <StatusMessages
        error={params.error}
        message={params.message}
      />

      <section className="mt-7 rounded-xl border border-[#dfe6e2] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">
          Tambah gejala
        </h2>

        <SymptomForm action={createSymptom} />
      </section>

      <section className="mt-7 space-y-4">
        {symptoms.map((symptom) => (
          <article
            key={symptom.id}
            className="rounded-xl border border-[#dfe6e2] bg-white p-5 sm:p-7"
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">
                    {symptom.code}
                  </span>

                  {symptom.is_crisis && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      Keselamatan
                    </span>
                  )}

                  <span
                    className={
                      symptom.is_active
                        ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    }
                  >
                    {symptom.is_active
                      ? "Aktif"
                      : "Tidak aktif"}
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-semibold">
                  {symptom.name}
                </h2>
              </div>

              <span className="text-sm text-slate-500">
                Urutan {symptom.display_order}
              </span>
            </div>

            <SymptomForm
              action={updateSymptom}
              symptom={symptom}
            />

            {profile.role === "admin" && (
              <form
                action={deleteSymptom}
                className="mt-5 border-t border-[#dfe6e2] pt-5"
              >
                <input
                  type="hidden"
                  name="id"
                  value={symptom.id}
                />

                <button
                  type="submit"
                  className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Hapus gejala
                </button>
              </form>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function SymptomForm({
  action,
  symptom,
}: {
  action: (formData: FormData) => Promise<void>;
  symptom?: Symptom;
}) {
  return (
    <form action={action} className="mt-5 grid gap-5">
      {symptom && (
        <input
          type="hidden"
          name="id"
          value={symptom.id}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
        <Field
          label="Kode"
          name="code"
          defaultValue={symptom?.code}
          placeholder="G001"
        />

        <Field
          label="Urutan"
          name="displayOrder"
          type="number"
          defaultValue={String(
            symptom?.display_order ?? 0,
          )}
        />
      </div>

      <Field
        label="Nama gejala"
        name="name"
        defaultValue={symptom?.name}
        placeholder="Suasana hati menurun"
      />

      <Textarea
        label="Pertanyaan"
        name="question"
        defaultValue={symptom?.question}
        required
      />

      <Textarea
        label="Penjelasan"
        name="explanation"
        defaultValue={symptom?.explanation ?? ""}
      />

      <div className="flex flex-wrap gap-6">
        <Checkbox
          name="isActive"
          label="Gejala aktif"
          defaultChecked={
            symptom?.is_active ?? true
          }
        />

        <Checkbox
          name="isCrisis"
          label="Pertanyaan keselamatan"
          defaultChecked={
            symptom?.is_crisis ?? false
          }
        />
      </div>

      <button
        type="submit"
        className="min-h-12 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142] sm:w-fit"
      >
        {symptom
          ? "Simpan perubahan"
          : "Tambah gejala"}
      </button>
    </form>
  );
}

function StatusMessages({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <>
      {message && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        type={type}
        required
        min={type === "number" ? 0 : undefined}
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
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">
        {label}
      </span>

      <textarea
        name={name}
        rows={4}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-[#dfe6e2] px-4 py-3"
      />
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-5 accent-[#146b58]"
      />

      <span className="text-sm font-semibold">
        {label}
      </span>
    </label>
  );
}