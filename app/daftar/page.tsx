import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Brand } from "@/components/brand";
import { signUp } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const metadata = {
  title: "Daftar",
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex h-18 max-w-4xl items-center px-5 sm:px-8">
          <Brand />
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Kembali
        </Link>

        <section className="mt-5 rounded-2xl border border-[#dfe6e2] bg-white p-6 sm:p-8">
          <h1 className="text-3xl font-bold tracking-[-0.04em]">
            Buat akun
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Akun digunakan untuk menyimpan riwayat skrining secara
            privat.
          </p>

          {params.error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {params.error}
            </div>
          )}

          <form
            action={signUp}
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-semibold"
              >
                Nama
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
              />

              <p className="mt-2 text-xs text-slate-500">
                Minimal 8 karakter.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142]"
            >
              <UserPlus aria-hidden="true" size={18} />
              Daftar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah memiliki akun?{" "}
            <Link
              href="/masuk"
              className="font-semibold text-[#146b58]"
            >
              Masuk
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}