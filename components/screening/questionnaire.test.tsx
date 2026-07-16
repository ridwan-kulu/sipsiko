"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type {
  ScreeningAnswer,
  SymptomQuestion,
} from "@/features/screening/types";

type QuestionnaireProps = {
  questions: SymptomQuestion[];
};

const normalOptions = [
  {
    label: "Tidak pernah",
    description:
      "Tidak terjadi dalam dua minggu terakhir.",
    value: 0,
  },
  {
    label: "Beberapa hari",
    description: "Terjadi sesekali.",
    value: 0.25,
  },
  {
    label: "Lebih dari separuh waktu",
    description: "Terjadi cukup sering.",
    value: 0.75,
  },
  {
    label: "Hampir setiap hari",
    description:
      "Terjadi hampir setiap hari.",
    value: 1,
  },
];

const crisisOptions = [
  {
    label: "Tidak",
    description:
      "Saya tidak memiliki dorongan tersebut.",
    value: 0,
  },
  {
    label: "Ya",
    description:
      "Saya memiliki dorongan tersebut saat ini.",
    value: 1,
  },
];

export function Questionnaire({
  questions,
}: QuestionnaireProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  if (questions.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Pertanyaan belum tersedia
          </h1>

          <p className="mt-3 text-slate-600">
            Basis pengetahuan belum memiliki
            pertanyaan aktif.
          </p>
        </div>
      </main>
    );
  }

  const currentQuestion =
    questions[currentIndex];

  const selectedValue =
    answers[currentQuestion.id];

  const progress = Math.round(
    ((currentIndex + 1) /
      questions.length) *
      100,
  );

  const options = currentQuestion.is_crisis
    ? crisisOptions
    : normalOptions;

  const hasCrisisAnswer =
    currentQuestion.is_crisis &&
    selectedValue === 1;

  function selectAnswer(value: number) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));

    setErrorMessage(null);
  }

  function goBack() {
    if (currentIndex === 0) {
      router.push(
        "/skrining/persetujuan",
      );

      return;
    }

    setCurrentIndex(
      (current) => current - 1,
    );
  }

  async function continueScreening() {
    if (selectedValue === undefined) {
      setErrorMessage(
        "Silakan pilih salah satu jawaban.",
      );

      return;
    }

    if (hasCrisisAnswer) {
      return;
    }

    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (current) => current + 1,
      );

      return;
    }

    await submitAnswers();
  }

  async function submitAnswers() {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const consent =
        sessionStorage.getItem(
          "screeningConsent",
        );

      if (!consent) {
        router.replace(
          "/skrining/persetujuan",
        );

        return;
      }

      const requestAnswers: ScreeningAnswer[] =
        questions.map((question) => ({
          symptomId: question.id,
          userWeight:
            answers[question.id] ?? 0,
          durationDays: 14,
        }));

      const response = await fetch(
        "/api/inference",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            consentedAt: consent,
            answers: requestAnswers,
          }),
        },
      );

      const payload: unknown =
        await response.json();

      if (!response.ok) {
        const errorPayload =
          payload as {
            message?: string;
          };

        throw new Error(
          errorPayload.message ??
            "Hasil skrining tidak dapat diproses.",
        );
      }

      sessionStorage.setItem(
        "screeningResult",
        JSON.stringify(payload),
      );

      router.push("/skrining/hasil");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan ketika memproses jawaban.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex h-18 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Brand />

          <span className="text-sm text-slate-500">
            {currentIndex + 1} dari{" "}
            {questions.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <div
          role="progressbar"
          aria-label={`Progres skrining ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-[#146b58]"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <section className="mt-6 rounded-2xl border border-[#dfe6e2] bg-white p-6 sm:p-9">
          <span className="text-sm font-semibold text-[#146b58]">
            {currentQuestion.is_crisis
              ? "Pertanyaan keselamatan"
              : "Dalam dua minggu terakhir"}
          </span>

          <h1 className="mt-3 text-2xl leading-9 font-bold tracking-[-0.03em] sm:text-3xl">
            {currentQuestion.question}
          </h1>

          {currentQuestion.explanation && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {
                currentQuestion.explanation
              }
            </p>
          )}

          <div
            role="radiogroup"
            aria-label={
              currentQuestion.question
            }
            className="mt-7 space-y-3"
          >
            {options.map((option) => {
              const isSelected =
                selectedValue ===
                option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() =>
                    selectAnswer(
                      option.value,
                    )
                  }
                  className={
                    isSelected
                      ? "flex min-h-16 w-full items-center justify-between rounded-xl border border-[#146b58] bg-[#e5f3ed] p-4 text-left"
                      : "flex min-h-16 w-full items-center justify-between rounded-xl border border-[#dfe6e2] bg-white p-4 text-left hover:bg-slate-50"
                  }
                >
                  <span>
                    <span className="block font-semibold">
                      {option.label}
                    </span>

                    <span className="mt-1 block text-sm text-slate-500">
                      {
                        option.description
                      }
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={
                      isSelected
                        ? "size-5 rounded-full border-[6px] border-[#146b58] bg-white"
                        : "size-5 rounded-full border-2 border-slate-300 bg-white"
                    }
                  />
                </button>
              );
            })}
          </div>

          {hasCrisisAnswer && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <h2 className="font-bold">
                    Segera cari bantuan
                  </h2>

                  <p className="mt-2 text-sm leading-6">
                    Hubungi orang yang dipercaya,
                    tenaga kesehatan, atau layanan
                    darurat setempat sekarang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="mt-5 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#dfe6e2] px-5 font-semibold hover:bg-slate-50"
            >
              <ArrowLeft
                aria-hidden="true"
                size={18}
              />
              Kembali
            </button>

            {!hasCrisisAnswer && (
              <button
                type="button"
                disabled={
                  selectedValue ===
                    undefined ||
                  isSubmitting
                }
                onClick={
                  continueScreening
                }
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142] disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={18}
                    />
                    Memproses
                  </>
                ) : (
                  <>
                    {currentIndex ===
                    questions.length - 1
                      ? "Lihat hasil"
                      : "Lanjut"}

                    <ArrowRight
                      aria-hidden="true"
                      size={18}
                    />
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}