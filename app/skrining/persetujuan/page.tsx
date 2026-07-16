"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Brand } from "@/components/brand";

export default function ConsentPage() {
  const router = useRouter();
  const [hasConsented, setHasConsented] = useState(false);

  function continueScreening() {
    if (!hasConsented) {
      return;
    }

    sessionStorage.setItem(
      "screeningConsent",
      new Date().toISOString(),
    );

    sessionStorage.removeItem("screeningResult");

    router.push("/skrining/pertanyaan");
  }

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex h-18 max-w-4xl items-center px-5 sm:px-8">
          <Brand />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Kembali ke beranda
        </Link>

        <section className="mt-5 rounded-2xl border border-[#dfe6e2] bg-white p-6 sm:p-9">
          <span className="text-sm font-semibold text-[#146b58]">
            Sebelum memulai
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Persetujuan dan batasan penggunaan
          </h1>

          <p className="mt-5 leading-7 text-slate-600">
            Skrining ini membantu mengenali indikasi awal berdasarkan
            jawaban Anda. Hasilnya bukan diagnosis medis.
          </p>

          <div className="mt-7 space-y-4">
            {[
              "Jawaban digunakan untuk menghitung tingkat kecocokan gejala.",
              "Anda dapat berhenti dan keluar kapan saja.",
              "Hasil sebaiknya dibahas dengan tenaga kesehatan.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#146b58]"
                  size={20}
                />

                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={21}
            />

            <p className="text-sm leading-6">
              Jangan gunakan aplikasi ini untuk keadaan darurat. Jika
              terdapat bahaya langsung, segera hubungi layanan darurat
              setempat.
            </p>
          </div>

          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe6e2] p-4 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(event) =>
                setHasConsented(event.target.checked)
              }
              className="mt-1 size-5 accent-[#146b58]"
            />

            <span className="text-sm leading-6 text-slate-700">
              Saya memahami tujuan dan keterbatasan skrining serta
              menyetujui pemrosesan jawaban saya.
            </span>
          </label>

          <button
            type="button"
            disabled={!hasConsented}
            onClick={continueScreening}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#146b58] px-6 font-semibold text-white hover:bg-[#0c5142] disabled:bg-slate-300 sm:w-auto"
          >
            Saya setuju, lanjutkan
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </section>
      </div>
    </main>
  );
}