import {
  Activity,
  Brain,
  ClipboardList,
  History,
} from "lucide-react";
import { requireStaff } from "@/lib/auth/require-staff";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const { supabase } = await requireStaff();

  const [
    conditionsResult,
    symptomsResult,
    rulesResult,
    consultationsResult,
  ] = await Promise.all([
    supabase
      .from("conditions")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("symptoms")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("rules")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("consultations")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  const statistics = [
    {
      label: "Kondisi",
      value: conditionsResult.count ?? 0,
      icon: Brain,
    },
    {
      label: "Gejala",
      value: symptomsResult.count ?? 0,
      icon: Activity,
    },
    {
      label: "Aturan",
      value: rulesResult.count ?? 0,
      icon: ClipboardList,
    },
    {
      label: "Konsultasi",
      value: consultationsResult.count ?? 0,
      icon: History,
    },
  ];

  return (
    <div>
      <span className="text-sm font-semibold text-[#146b58]">
        Basis pengetahuan
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
        Dashboard admin
      </h1>

      <p className="mt-3 text-slate-600">
        Kelola kondisi, gejala, aturan, dan tinjau aktivitas
        perubahan basis pengetahuan.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-xl border border-[#dfe6e2] bg-white p-5"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-[#e5f3ed] text-[#146b58]">
                <Icon aria-hidden="true" size={20} />
              </span>

              <p className="mt-5 text-3xl font-bold">
                {item.value}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {item.label}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <h2 className="font-semibold">
          Validasi pakar diperlukan
        </h2>

        <p className="mt-2 text-sm leading-6">
          Setiap perubahan gejala, aturan, dan bobot harus ditinjau
          tenaga kesehatan sebelum digunakan pada pengguna.
        </p>
      </section>
    </div>
  );
}