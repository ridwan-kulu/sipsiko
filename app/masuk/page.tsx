import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { Brand } from "@/components/brand";
import { signIn } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Masuk",
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
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
            Masuk ke akun
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Masuk untuk menyimpan dan melihat riwayat skrining.
          </p>

          {params.message && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {params.message}
            </div>
          )}

          {params.error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {params.error}
            </div>
          )}

          <form
            action={signIn}
            className="mt-7 space-y-5"
          >
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
                placeholder="nama@email.com"
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
                autoComplete="current-password"
                className="mt-2 min-h-12 w-full rounded-lg border border-[#dfe6e2] px-4"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#146b58] px-5 font-semibold text-white hover:bg-[#0c5142]"
            >
              <LogIn aria-hidden="true" size={18} />
              Masuk
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Belum mempunyai akun?{" "}
            <Link
              href="/daftar"
              className="font-semibold text-[#146b58]"
            >
              Daftar
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}