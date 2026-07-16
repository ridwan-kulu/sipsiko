import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 font-bold tracking-tight text-slate-950"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[#146b58] text-white">
        <HeartPulse aria-hidden="true" size={22} />
      </span>

      <span className="text-lg">RuangPulih</span>
    </Link>
  );
}