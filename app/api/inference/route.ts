import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculateAllResults } from "@/features/inference/engine";
import { getActiveExpertRules } from "@/features/inference/repository";
import { inferenceRequestSchema } from "@/features/inference/schema";

const MAX_REQUEST_SIZE = 50_000;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

type ApiErrorOptions = {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
  emergency?: boolean;
};

function errorResponse({
  status,
  message,
  code,
  details,
  emergency,
}: ApiErrorOptions) {
  return NextResponse.json(
    {
      status: "error",
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
      ...(emergency !== undefined
        ? { emergency }
        : {}),
    },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

function validateRequestHeaders(
  request: Request,
): NextResponse | null {
  const contentType =
    request.headers.get("content-type");

  if (
    !contentType
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return errorResponse({
      status: 415,
      code: "INVALID_CONTENT_TYPE",
      message:
        "Content-Type harus application/json.",
    });
  }

  const contentLengthHeader =
    request.headers.get("content-length");

  if (contentLengthHeader) {
    const contentLength = Number(
      contentLengthHeader,
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_REQUEST_SIZE
    ) {
      return errorResponse({
        status: 413,
        code: "REQUEST_TOO_LARGE",
        message:
          "Ukuran request melebihi batas yang diizinkan.",
      });
    }
  }

  return null;
}

function containsDuplicateSymptoms(
  answers: Array<{
    symptomId: string;
  }>,
): boolean {
  const symptomIds = answers.map(
    (answer) => answer.symptomId,
  );

  return (
    new Set(symptomIds).size !==
    symptomIds.length
  );
}

async function detectCrisisAnswer(
  answers: Array<{
    symptomId: string;
    userWeight: number;
  }>,
): Promise<boolean> {
  const admin = createAdminClient();

  const {
    data: crisisSymptoms,
    error,
  } = await admin
    .from("symptoms")
    .select("id")
    .eq("is_crisis", true)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `Crisis detection failed: ${error.message}`,
    );
  }

  const crisisSymptomIds = new Set(
    (crisisSymptoms ?? []).map(
      (symptom) => symptom.id,
    ),
  );

  return answers.some(
    (answer) =>
      crisisSymptomIds.has(
        answer.symptomId,
      ) && answer.userWeight > 0,
  );
}

export async function POST(
  request: Request,
) {
  const requestId = crypto.randomUUID();

  let createdConsultationId:
    | string
    | null = null;

  try {
    /*
     * 1. Validasi header dan ukuran request.
     */
    const invalidRequest =
      validateRequestHeaders(request);

    if (invalidRequest) {
      return invalidRequest;
    }

    /*
     * 2. Ambil dan validasi request body.
     */
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse({
        status: 400,
        code: "INVALID_JSON",
        message:
          "Format JSON tidak valid.",
      });
    }

    const validation =
      inferenceRequestSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse({
        status: 400,
        code: "INVALID_ANSWERS",
        message:
          "Jawaban skrining tidak valid.",
        details:
          validation.error.flatten(),
      });
    }

    const {
      answers,
      consentedAt,
    } = validation.data;

    /*
     * 3. Pastikan satu gejala tidak dikirim
     *    lebih dari satu kali.
     */
    if (
      containsDuplicateSymptoms(answers)
    ) {
      return errorResponse({
        status: 400,
        code: "DUPLICATE_SYMPTOM",
        message:
          "Satu gejala tidak boleh memiliki lebih dari satu jawaban.",
      });
    }

    /*
     * 4. Deteksi kondisi krisis di sisi server.
     *
     * Pemeriksaan ini tetap dilakukan di server
     * walaupun client sudah memiliki pemeriksaan
     * keselamatan.
     */
    const hasCrisisAnswer =
      await detectCrisisAnswer(answers);

    if (hasCrisisAnswer) {
      return errorResponse({
        status: 422,
        code: "CRISIS_RESPONSE",
        emergency: true,
        message:
          "Jawaban menunjukkan bahwa bantuan segera mungkin diperlukan. Hubungi orang yang dipercaya, tenaga kesehatan, atau layanan darurat setempat sekarang.",
      });
    }

    /*
     * 5. Ambil basis pengetahuan aktif.
     */
    const rules =
      await getActiveExpertRules();

    if (rules.length === 0) {
      return errorResponse({
        status: 503,
        code:
          "KNOWLEDGE_BASE_UNAVAILABLE",
        message:
          "Basis pengetahuan belum tersedia.",
      });
    }

    /*
     * 6. Jalankan mesin inferensi.
     */
    const results =
      calculateAllResults(
        rules,
        answers,
      );

    /*
     * 7. Periksa session pengguna.
     *
     * Pengguna anonim tetap dapat melakukan
     * skrining, tetapi hasilnya tidak disimpan
     * dalam database.
     */
    const userClient =
      await createClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();

    /*
     * 8. Simpan data jika pengguna sudah login.
     */
    if (user) {
      const admin =
        createAdminClient();

      const completedAt =
        new Date().toISOString();

      /*
       * Buat konsultasi.
       */
      const {
        data: consultation,
        error: consultationError,
      } = await admin
        .from("consultations")
        .insert({
          user_id: user.id,
          status: "completed",

          consented_at:
            consentedAt ??
            completedAt,

          completed_at:
            completedAt,
        })
        .select("id")
        .single();

      if (
        consultationError ||
        !consultation
      ) {
        throw new Error(
          consultationError?.message ??
            "Consultation creation failed.",
        );
      }

      createdConsultationId =
        consultation.id;

      /*
       * Simpan jawaban.
       */
      const answerRows = answers.map(
        (answer) => ({
          consultation_id:
            consultation.id,

          symptom_id:
            answer.symptomId,

          user_weight:
            answer.userWeight,

          duration_days:
            answer.durationDays ??
            null,
        }),
      );

      const {
        error: answersError,
      } = await admin
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        throw new Error(
          `Answer insertion failed: ${answersError.message}`,
        );
      }

      /*
       * Simpan hasil inferensi.
       */
      if (results.length > 0) {
        const resultRows =
          results.map(
            (result, index) => ({
              consultation_id:
                consultation.id,

              condition_id:
                result.conditionId,

              score:
                result.score,

              rank:
                index + 1,

              explanation: {
                method:
                  "certainty-factor",

                level:
                  result.level,

                percentage:
                  result.percentage,

                matchedSymptoms:
                  result.matchedSymptoms,

                missingRequiredSymptoms:
                  result.missingRequiredSymptoms,

                ruleVersion:
                  "1.0.0",

                calculatedAt:
                  completedAt,
              },
            }),
          );

        const {
          error: resultsError,
        } = await admin
          .from("results")
          .insert(resultRows);

        if (resultsError) {
          throw new Error(
            `Result insertion failed: ${resultsError.message}`,
          );
        }
      }
    }

    /*
     * 9. Kirim hasil.
     */
    return NextResponse.json(
      {
        status: "success",

        data: {
          results,

          topResult:
            results[0] ?? null,

          consultationId:
            createdConsultationId,

          saved:
            Boolean(
              createdConsultationId,
            ),
        },

        disclaimer:
          "Hasil merupakan tingkat kecocokan sistem dan bukan diagnosis medis.",
      },
      {
        status: 200,
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    /*
     * 10. Jika penyimpanan gagal di tengah
     * proses, hapus konsultasi.
     *
     * Jawaban dan hasil ikut terhapus karena
     * foreign key menggunakan ON DELETE CASCADE.
     */
    if (createdConsultationId) {
      try {
        const admin =
          createAdminClient();

        await admin
          .from("consultations")
          .delete()
          .eq(
            "id",
            createdConsultationId,
          );
      } catch (cleanupError) {
        console.error(
          "Inference cleanup failed",
          {
            requestId,

            message:
              cleanupError instanceof
              Error
                ? cleanupError.message
                : "Unknown cleanup error",
          },
        );
      }
    }

    /*
     * Jangan mencatat jawaban atau data sensitif
     * pengguna ke log.
     */
    console.error(
      "Inference request failed",
      {
        requestId,

        message:
          error instanceof Error
            ? error.message
            : "Unknown inference error",
      },
    );

    return errorResponse({
      status: 500,
      code: "INFERENCE_FAILED",
      message:
        "Tidak dapat memproses hasil skrining.",
      details: {
        requestId,
      },
    });
  }
}