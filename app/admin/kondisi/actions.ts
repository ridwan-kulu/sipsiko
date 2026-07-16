"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireStaff } from "@/lib/auth/require-staff";
import { conditionSchema } from "@/features/admin/condition-schema";

function parseConditionForm(formData: FormData) {
  return conditionSchema.safeParse({
    id: formData.get("id") || undefined,
    code: formData.get("code"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    recommendation: formData.get("recommendation"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCondition(
  formData: FormData,
) {
  const { supabase } = await requireStaff();

  const validation =
    parseConditionForm(formData);

  if (!validation.success) {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        validation.error.issues[0]?.message ??
          "Data kondisi tidak valid.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("conditions")
    .insert({
      code: validation.data.code,
      name: validation.data.name,
      slug: validation.data.slug,
      description: validation.data.description,
      recommendation:
        validation.data.recommendation,
      is_active: validation.data.isActive,
    });

  if (error) {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kondisi");

  redirect(
    `/admin/kondisi?message=${encodeURIComponent(
      "Kondisi berhasil ditambahkan.",
    )}`,
  );
}

export async function updateCondition(
  formData: FormData,
) {
  const { supabase } = await requireStaff();

  const validation =
    parseConditionForm(formData);

  if (!validation.success || !validation.data.id) {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        validation.success
          ? "ID kondisi tidak tersedia."
          : validation.error.issues[0]?.message ??
              "Data kondisi tidak valid.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("conditions")
    .update({
      code: validation.data.code,
      name: validation.data.name,
      slug: validation.data.slug,
      description: validation.data.description,
      recommendation:
        validation.data.recommendation,
      is_active: validation.data.isActive,
    })
    .eq("id", validation.data.id);

  if (error) {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kondisi");

  redirect(
    `/admin/kondisi?message=${encodeURIComponent(
      "Kondisi berhasil diperbarui.",
    )}`,
  );
}

export async function deleteCondition(
  formData: FormData,
) {
  const { supabase } = await requireAdmin();

  const id = formData.get("id");

  if (typeof id !== "string") {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        "ID kondisi tidak valid.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("conditions")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/kondisi?error=${encodeURIComponent(
        "Kondisi tidak dapat dihapus. Nonaktifkan kondisi jika sudah digunakan oleh aturan atau hasil konsultasi.",
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kondisi");

  redirect(
    `/admin/kondisi?message=${encodeURIComponent(
      "Kondisi berhasil dihapus.",
    )}`,
  );
}