"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value.trim();
}

export async function signIn(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(
    formData,
    "password",
  );

  if (!email || !password) {
    redirect(
      `/masuk?error=${encodeURIComponent(
        "Email dan password wajib diisi.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    redirect(
      `/masuk?error=${encodeURIComponent(
        "Email atau password tidak valid.",
      )}`,
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const fullName = getFormValue(
    formData,
    "fullName",
  );

  const email = getFormValue(formData, "email");

  const password = getFormValue(
    formData,
    "password",
  );

  if (!fullName || !email || !password) {
    redirect(
      `/daftar?error=${encodeURIComponent(
        "Semua kolom wajib diisi.",
      )}`,
    );
  }

  if (password.length < 8) {
    redirect(
      `/daftar?error=${encodeURIComponent(
        "Password minimal 8 karakter.",
      )}`,
    );
  }

  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: fullName,
        },

        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

  if (error) {
    redirect(
      `/daftar?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect(
    `/masuk?message=${encodeURIComponent(
      "Registrasi berhasil. Periksa email untuk mengaktifkan akun.",
    )}`,
  );
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}