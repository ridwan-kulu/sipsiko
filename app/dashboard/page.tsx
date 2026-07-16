import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

type ConsultationResult = {
  id: string;
  score: number | string;
  rank: number;

  conditions: {
    name: string;
    slug: string;
  } | null;
};

type Consultation = {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  results: ConsultationResult[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("consultations")
    .select(`
      id,
      status,
      created_at,
      completed_at,
      results (
        id,
        score,
        rank,
        conditions (
          name,
          slug
        )
      )
    `)
    .eq("status", "completed")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Riwayat gagal dimuat: ${error.message}`,
    );
  }

  const consultations =
    (data ?? []) as unknown as Consultation[];

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Brand />

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dfe6e2] px-4 text-sm font-semibold hover:bg-slate-50"
            >
              <LogOut aria-hidden="true" size={17} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-sm font-semibold text-[#146b58]">
              Dashboard
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
              Halo, {profile?.full_name || "Pengguna"}
            </h1>

            <p className="mt-2 text-slate-600">
              Lihat riwayat skrining yang tersimpan di akun Anda.
            </p>
          </div>

          <Link
            href="/skrining/persetujuan"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142]"
          >
            Skrining baru
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <section className="mt-9">
          <div className="flex items-center gap-3">
            <ClipboardList
              aria-hidden="true"
              className="text-[#146b58]"
            />

            <h2 className="text-xl font-semibold">
              Riwayat skrining
            </h2>
          </div>

          {consultations.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#cbd5d0] bg-white p-10 text-center">
              <h3 className="font-semibold">
                Belum ada riwayat
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Lakukan skrining ketika sedang login agar hasil
                tersimpan.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {consultations.map((consultation) => {
                const topResult =
                  consultation.results
                    .slice()
                    .sort(
                      (first, second) =>
                        first.rank - second.rank,
                    )[0];

                return (
                  <article
                    key={consultation.id}
                    className="rounded-xl border border-[#dfe6e2] bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays
                            aria-hidden="true"
                            size={16}
                          />

                          {formatDate(
                            consultation.completed_at ??
                              consultation.created_at,
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-semibold">
                          {topResult?.conditions?.name ??
                            "Tidak ada hasil utama"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Hasil merupakan tingkat kecocokan sistem,
                          bukan diagnosis.
                        </p>
                      </div>

                      {topResult && (
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#146b58]">
                            {Math.round(
                              Number(topResult.score) * 100,
                            )}
                            %
                          </div>

                          <span className="text-xs text-slate-500">
                            Kecocokan sistem
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}