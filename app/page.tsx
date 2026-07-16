import Link from "next/link";
import {
  ArrowRight,
  Brain,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";

const benefits = [
  {
    title: "Privat",
    description:
      "Jawaban hanya digunakan untuk memproses hasil skrining.",
    icon: LockKeyhole,
  },
  {
    title: "Dapat dijelaskan",
    description:
      "Hasil menunjukkan faktor yang mendukung perhitungan.",
    icon: Brain,
  },
  {
    title: "Berorientasi keselamatan",
    description:
      "Terdapat alur khusus untuk kondisi yang membutuhkan bantuan.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <>
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand />

          <nav
  aria-label="Navigasi utama"
  className="flex items-center gap-3"
>
  <Link
    href="/masuk"
    className="hidden min-h-11 items-center px-3 text-sm font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex"
  >
    Masuk
  </Link>

  <Link
    href="/skrining/persetujuan"
    className="inline-flex min-h-11 items-center rounded-lg bg-[#146b58] px-5 text-sm font-semibold text-white hover:bg-[#0c5142]"
  >
    Mulai skrining
  </Link>
</nav>
        </div>
      </header>

      <main>
        <section className="bg-[#f8faf9]">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-18 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#146b58]">
                <Sparkles aria-hidden="true" size={17} />
                Ruang aman untuk memahami diri
              </div>

              <h1 className="mt-5 max-w-2xl text-5xl leading-[1.05] font-bold tracking-[-0.05em] text-slate-950 sm:text-6xl">
                Kenali apa yang sedang Anda rasakan.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Skrining awal kesehatan mental yang terarah,
                mudah digunakan, dan memberikan hasil yang dapat
                dijelaskan.
              </p>

              <div className="mt-8">
                <Link
                  href="/skrining/persetujuan"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#146b58] px-6 font-semibold text-white hover:bg-[#0c5142]"
                >
                  Mulai skrining
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Sekitar 5 menit · Hasil bukan diagnosis medis
              </p>
            </div>

            <div className="rounded-3xl border border-[#d8e9e2] bg-[#edf6f2] p-5 sm:p-8">
              <div className="rounded-2xl border border-[#dfe6e2] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <strong>Skrining awal</strong>

                  <span className="rounded-full bg-[#e5f3ed] px-3 py-1 text-xs font-semibold text-[#0c5142]">
                    Pertanyaan 3 dari 7
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[43%] bg-[#146b58]" />
                </div>

                <p className="mt-7 text-xl leading-8 font-semibold">
                  Dalam dua minggu terakhir, seberapa sering Anda
                  sulit mengendalikan rasa khawatir?
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-lg border border-[#dfe6e2] p-4">
                    Tidak pernah
                  </div>

                  <div className="rounded-lg border border-[#146b58] bg-[#e5f3ed] p-4 font-semibold text-[#0c5142]">
                    Beberapa hari
                  </div>

                  <div className="rounded-lg border border-[#dfe6e2] p-4">
                    Hampir setiap hari
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#dfe6e2] bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="flex gap-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e5f3ed] text-[#146b58]">
                    <Icon aria-hidden="true" size={21} />
                  </span>

                  <div>
                    <h2 className="font-semibold">
                      {benefit.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-[#f3f7f5] py-18">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="rounded-2xl border border-[#d8e9e2] bg-white p-7">
              <h2 className="text-xl font-semibold">
                Penting untuk diketahui
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                RuangPulih adalah alat skrining awal, bukan alat
                diagnosis medis. Hasil tidak menggantikan pemeriksaan
                oleh psikolog, psikiater, atau tenaga kesehatan.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dfe6e2] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-slate-500 sm:px-8">
          © 2026 RuangPulih · Skrining awal, bukan diagnosis medis.
        </div>
      </footer>
    </>
  );
}