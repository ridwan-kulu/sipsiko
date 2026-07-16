"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ruleSchema } from "@/features/admin/rule-schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireStaff } from "@/lib/auth/require-staff";

function parseRuleForm(formData: FormData) {
  const minimumDurationValue = formData.get(
    "minimumDurationDays",
  );

  const minimumDurationDays =
    typeof minimumDurationValue === "string" &&
    minimumDurationValue.trim() !== ""
      ? Number(minimumDurationValue)
      : null;

  return ruleSchema.safeParse({
    id: formData.get("id") || undefined,
    conditionId: formData.get("conditionId"),
    symptomId: formData.get("symptomId"),
    expertWeight: Number(
      formData.get("expertWeight"),
    ),
    isRequired:
      formData.get("isRequired") === "on",
    minimumDurationDays,
  });
}

function redirectWithError(
  message: string,
): never {
  redirect(
    `/admin/aturan?error=${encodeURIComponent(
      message,
    )}`,
  );
}

function redirectWithSuccess(
  message: string,
): never {
  redirect(
    `/admin/aturan?message=${encodeURIComponent(
      message,
    )}`,
  );
}

function revalidateRules(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/aturan");
}

/**
 * Menambahkan aturan baru.
 */
export async function createRule(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireStaff();

  const parsed = parseRuleForm(formData);

  if (!parsed.success) {
    redirectWithError(
      parsed.error.issues[0]?.message ??
        "Aturan tidak valid.",
    );
  }

  const {
    conditionId,
    symptomId,
    expertWeight,
    isRequired,
    minimumDurationDays,
  } = parsed.data;

  const { error } = await supabase
    .from("rules")
    .insert({
      condition_id: conditionId,
      symptom_id: symptomId,
      expert_weight: expertWeight,
      is_required: isRequired,
      minimum_duration_days:
        minimumDurationDays,
    });

  if (error) {
    if (error.code === "23505") {
      redirectWithError(
        "Relasi kondisi dan gejala tersebut sudah ada.",
      );
    }

    redirectWithError(
      error.message ||
        "Aturan gagal ditambahkan.",
    );
  }

  revalidateRules();

  redirectWithSuccess(
    "Aturan berhasil ditambahkan.",
  );
}

/**
 * Memperbarui aturan.
 */
export async function updateRule(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireStaff();

  const parsed = parseRuleForm(formData);

  if (!parsed.success) {
    redirectWithError(
      parsed.error.issues[0]?.message ??
        "Aturan tidak valid.",
    );
  }

  const {
    id,
    conditionId,
    symptomId,
    expertWeight,
    isRequired,
    minimumDurationDays,
  } = parsed.data;

  if (!id) {
    redirectWithError(
      "ID aturan tidak tersedia.",
    );
  }

  const { data, error } = await supabase
    .from("rules")
    .update({
      condition_id: conditionId,
      symptom_id: symptomId,
      expert_weight: expertWeight,
      is_required: isRequired,
      minimum_duration_days:
        minimumDurationDays,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirectWithError(
        "Relasi kondisi dan gejala tersebut sudah ada.",
      );
    }

    redirectWithError(
      error.message ||
        "Aturan gagal diperbarui.",
    );
  }

  if (!data) {
    redirectWithError(
      "Aturan tidak ditemukan atau Anda tidak memiliki izin.",
    );
  }

  revalidateRules();

  redirectWithSuccess(
    "Aturan berhasil diperbarui.",
  );
}

/**
 * Menghapus aturan.
 *
 * Hanya role admin yang dapat menjalankan tindakan ini.
 */
export async function deleteRule(
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
      "ID aturan tidak valid.",
    );
  }

  const { data, error } = await supabase
    .from("rules")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(
      error.message ||
        "Aturan gagal dihapus.",
    );
  }

  if (!data) {
    redirectWithError(
      "Aturan tidak ditemukan atau Anda tidak memiliki izin.",
    );
  }

  revalidateRules();

  redirectWithSuccess(
    "Aturan berhasil dihapus.",
  );
}