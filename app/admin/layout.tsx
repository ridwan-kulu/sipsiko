import Link from "next/link";
import {
  Activity,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScrollText,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { signOut } from "@/app/auth/actions";
import { requireStaff } from "@/lib/auth/require-staff";

const navigation = [
  {
    href: "/admin",
    label: "Ringkasan",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/kondisi",
    label: "Kondisi",
    icon: Brain,
  },
  {
    href: "/admin/gejala",
    label: "Gejala",
    icon: Activity,
  },
  {
    href: "/admin/aturan",
    label: "Aturan",
    icon: ClipboardList,
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    icon: ScrollText,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="border-b border-[#dfe6e2] bg-white">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Brand />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {profile.full_name || "Staf"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {profile.role}
              </p>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dfe6e2] px-4 text-sm font-semibold hover:bg-slate-50"
              >
                <LogOut aria-hidden="true" size={17} />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside>
          <nav
            aria-label="Navigasi admin"
            className="grid gap-1 rounded-xl border border-[#dfe6e2] bg-white p-2"
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-[#e5f3ed] hover:text-[#0c5142]"
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/dashboard"
            className="mt-4 flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-white"
          >
            Kembali ke dashboard
          </Link>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}