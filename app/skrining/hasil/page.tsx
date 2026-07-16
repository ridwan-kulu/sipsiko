"use client";

import {
  useMemo,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { InferenceResult } from "@/features/inference/types";

const SCREENING_RESULT_KEY = "screeningResult";

type InferencePayload = {
  status: "success";

  data: {
    results: InferenceResult[];
    topResult: InferenceResult | null;
  };

  disclaimer: string;
};

/**
 * Mendengarkan perubahan Web Storage.
 *
 * Storage event berjalan ketika nilai storage berubah
 * dari tab atau window lain.
 */
function subscribeToStorage(
  callback: () => void,
): () => void {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(
      "storage",
      callback,
    );
  };
}

/**
 * Mengambil nilai sessionStorage di browser.
 */
function getStorageSnapshot(): string | null {
  return window.sessionStorage.getItem(
    SCREENING_RESULT_KEY,
  );
}

/**
 * Nilai yang digunakan saat server-side rendering.
 */
function getServerStorageSnapshot(): null {
  return null;
}

/**
 * Subscription kosong untuk mendeteksi hydration tanpa
 * menggunakan useEffect dan setState.
 */
function subscribeToHydration(): () => void {
  return () => undefined;
}

function getClientHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

/**
 * Memvalidasi struktur data hasil inferensi.
 */
function isInferencePayload(
  value: unknown,
): value is InferencePayload {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<InferencePayload>;

  if (candidate.status !== "success") {
    return false;
  }

  if (
    typeof candidate.data !== "object" ||
    candidate.data === null
  ) {
    return false;
  }

  if (!Array.isArray(candidate.data.results)) {
    return false;
  }

  if (
    typeof candidate.disclaimer !== "string"
  ) {
    return false;
  }

  return true;
}

/**
 * Mengubah nilai JSON sessionStorage menjadi payload.
 *
 * Fungsi ini tidak melakukan side effect agar aman
 * dipanggil ketika render.
 */
function parseStoredPayload(
  value: string | null,
): InferencePayload | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return isInferencePayload(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getLevelLabel(
  level: InferenceResult["level"],
): string {
  switch (level) {
    case "tinggi":
      return "Kecocokan tinggi";

    case "sedang":
      return "Kecocokan sedang";

    default:
      return "Kecocokan rendah";
  }
}

export default function ResultPage() {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const storedResult = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerStorageSnapshot,
  );

  const payload = useMemo(
    () => parseStoredPayload(storedResult),
    [storedResult],
  );

  if (!isHydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf9]">
        <p
          role="status"
          className="text-slate-500"
        >
          Memuat hasil...
        </p>
      </main>
    );
  }

  const topResult = payload?.data.topResult;

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex h-18 max-w-4xl items-center px-5 sm:px-8">
          <Brand />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        {!topResult ? (
          <section className="rounded-2xl border border-[#dfe6e2] bg-white p-8 text-center">
            <h1 className="text-2xl font-bold">
              Hasil belum tersedia
            </h1>

            <p className="mt-3 text-slate-600">
              Selesaikan pertanyaan skrining
              terlebih dahulu.
            </p>

            <Link
              href="/skrining/persetujuan"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#146b58] px-6 font-semibold text-white hover:bg-[#0c5142]"
            >
              Mulai skrining
              <ArrowRight
                aria-hidden="true"
                size={18}
              />
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-[#dfe6e2] bg-white p-6 sm:p-9">
              <span className="text-sm font-semibold text-[#146b58]">
                Hasil skrining awal
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                {topResult.conditionName}
              </h1>

              <div className="mt-7 flex flex-wrap items-end gap-4">
                <span className="text-6xl font-bold tracking-[-0.06em] text-[#146b58]">
                  {topResult.percentage}%
                </span>

                <span className="mb-2 rounded-full bg-[#e5f3ed] px-3 py-1 text-sm font-semibold text-[#0c5142]">
                  {getLevelLabel(
                    topResult.level,
                  )}
                </span>
              </div>

              <p className="mt-4 leading-7 text-slate-600">
                Persentase menunjukkan tingkat
                kecocokan sistem, bukan probabilitas
                klinis atau kepastian diagnosis.
              </p>

              <div className="my-8 border-t border-[#dfe6e2]" />

              <h2 className="text-xl font-semibold">
                Faktor yang mendukung
              </h2>

              {topResult.matchedSymptoms.length >
              0 ? (
                <div className="mt-4 space-y-4">
                  {topResult.matchedSymptoms.map(
                    (symptom) => (
                      <div
                        key={symptom.symptomId}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-[#146b58]"
                          size={20}
                        />

                        <div>
                          <p className="font-medium">
                            {
                              symptom.symptomName
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Nilai faktor{" "}
                            {Math.round(
                              symptom.certaintyValue *
                                100,
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Tidak ada faktor pendukung yang
                  tersedia.
                </p>
              )}

              <div className="my-8 border-t border-[#dfe6e2]" />

              <h2 className="text-xl font-semibold">
                Langkah yang disarankan
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {topResult.recommendation}
              </p>
            </section>

            <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <h2 className="font-bold">
                    Hasil ini bukan diagnosis medis
                  </h2>

                  <p className="mt-2 text-sm leading-6">
                    Diagnosis hanya dapat diberikan
                    oleh tenaga kesehatan melalui
                    pemeriksaan yang sesuai.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/skrining/persetujuan"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#dfe6e2] bg-white px-5 font-semibold hover:bg-slate-50"
              >
                <RotateCcw
                  aria-hidden="true"
                  size={18}
                />
                Ulangi skrining
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142]"
              >
                Beranda
                <ArrowRight
                  aria-hidden="true"
                  size={18}
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}