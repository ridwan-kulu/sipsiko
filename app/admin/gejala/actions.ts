"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { symptomSchema } from "@/features/admin/symptom-schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireStaff } from "@/lib/auth/require-staff";

function parseSymptomForm(formData: FormData) {
  const explanationValue =
    formData.get("explanation");

  const displayOrderValue =
    formData.get("displayOrder");

  return symptomSchema.safeParse({
    id: formData.get("id") || undefined,

    code: formData.get("code"),
    name: formData.get("name"),
    question: formData.get("question"),

    explanation:
      typeof explanationValue === "string" &&
      explanationValue.trim().length > 0
        ? explanationValue.trim()
        : null,

    displayOrder:
      typeof displayOrderValue === "string" &&
      displayOrderValue.trim().length > 0
        ? Number(displayOrderValue)
        : 0,

    isCrisis:
      formData.get("isCrisis") === "on",

    isActive:
      formData.get("isActive") === "on",
  });
}

function redirectWithError(
  message: string,
): never {
  redirect(
    `/admin/gejala?error=${encodeURIComponent(
      message,
    )}`,
  );
}

function redirectWithSuccess(
  message: string,
): never {
  redirect(
    `/admin/gejala?message=${encodeURIComponent(
      message,
    )}`,
  );
}

function revalidateSymptomPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/gejala");
  revalidatePath("/admin/aturan");
  revalidatePath("/skrining/pertanyaan");
}

/**
 * Menambahkan gejala baru.
 */
export async function createSymptom(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireStaff();

  const parsed = parseSymptomForm(formData);

  if (!parsed.success) {
    redirectWithError(
      parsed.error.issues[0]?.message ??
        "Data gejala tidak valid.",
    );
  }

  const {
    code,
    name,
    question,
    explanation,
    displayOrder,
    isCrisis,
    isActive,
  } = parsed.data;

  const { error } = await supabase
    .from("symptoms")
    .insert({
      code,
      name,
      question,
      explanation,
      display_order: displayOrder,
      is_crisis: isCrisis,
      is_active: isActive,
    });

  if (error) {
    if (error.code === "23505") {
      redirectWithError(
        `Gejala dengan kode "${code}" sudah tersedia.`,
      );
    }

    redirectWithError(
      error.message ||
        "Gejala gagal ditambahkan.",
    );
  }

  revalidateSymptomPages();

  redirectWithSuccess(
    "Gejala berhasil ditambahkan.",
  );
}

/**
 * Memperbarui gejala.
 */
export async function updateSymptom(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireStaff();

  const parsed = parseSymptomForm(formData);

  if (!parsed.success) {
    redirectWithError(
      parsed.error.issues[0]?.message ??
        "Data gejala tidak valid.",
    );
  }

  const {
    id,
    code,
    name,
    question,
    explanation,
    displayOrder,
    isCrisis,
    isActive,
  } = parsed.data;

  if (!id) {
    redirectWithError(
      "ID gejala tidak tersedia.",
    );
  }

  const { data, error } = await supabase
    .from("symptoms")
    .update({
      code,
      name,
      question,
      explanation,
      display_order: displayOrder,
      is_crisis: isCrisis,
      is_active: isActive,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirectWithError(
        `Gejala dengan kode "${code}" sudah tersedia.`,
      );
    }

    redirectWithError(
      error.message ||
        "Gejala gagal diperbarui.",
    );
  }

  if (!data) {
    redirectWithError(
      "Gejala tidak ditemukan atau Anda tidak memiliki izin.",
    );
  }

  revalidateSymptomPages();

  redirectWithSuccess(
    "Gejala berhasil diperbarui.",
  );
}

/**
 * Menghapus gejala.
 *
 * Hanya pengguna dengan role admin yang dapat menghapus.
 */
export async function deleteSymptom(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireAdmin();

  const rawId = formData.get("id");

  const id =
    typeof rawId === "string"
      ? rawId.trim()
      : "";

  if (!id) {
    redirectWithError(
      "ID gejala tidak valid.",
    );
  }

  const { data, error } = await supabase
    .from("symptoms")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23503") {
      redirectWithError(
        "Gejala tidak dapat dihapus karena sudah digunakan oleh aturan atau jawaban konsultasi. Nonaktifkan gejala sebagai alternatif.",
      );
    }

    redirectWithError(
      error.message ||
        "Gejala gagal dihapus.",
    );
  }

  if (!data) {
    redirectWithError(
      "Gejala tidak ditemukan atau Anda tidak memiliki izin.",
    );
  }

  revalidateSymptomPages();

  redirectWithSuccess(
    "Gejala berhasil dihapus.",
  );
}