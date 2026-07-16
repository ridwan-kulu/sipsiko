import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/masuk?error=${encodeURIComponent(
          "Kode konfirmasi tidak tersedia.",
        )}`,
        url.origin,
      ),
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/masuk?error=${encodeURIComponent(
          "Tautan konfirmasi tidak valid atau kedaluwarsa.",
        )}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", url.origin),
  );
}