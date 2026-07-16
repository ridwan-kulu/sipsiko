import { requireStaff } from "@/lib/auth/require-staff";

type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  role: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

function getActionLabel(action: string) {
  switch (action) {
    case "create":
      return "Dibuat";
    case "update":
      return "Diperbarui";
    case "delete":
      return "Dihapus";
    default:
      return action;
  }
}

export const metadata = {
  title: "Audit Log",
};

export default async function AuditPage() {
  const { supabase } = await requireStaff();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as AuditLog[];

  const actorIds = Array.from(
    new Set(
      logs
        .map((log) => log.actor_id)
        .filter(
          (id): id is string => Boolean(id),
        ),
    ),
  );

  let profiles: Profile[] = [];

  if (actorIds.length > 0) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", actorIds);

    profiles = (profileData ?? []) as Profile[];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return (
    <div>
      <span className="text-sm font-semibold text-[#146b58]">
        Keamanan dan perubahan
      </span>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
        Audit log
      </h1>

      <p className="mt-3 text-slate-600">
        Seratus perubahan terbaru pada basis pengetahuan.
      </p>

      <section className="mt-7 overflow-hidden rounded-xl border border-[#dfe6e2] bg-white">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Belum ada aktivitas perubahan.
          </div>
        ) : (
          <div className="divide-y divide-[#dfe6e2]">
            {logs.map((log) => {
              const actor = log.actor_id
                ? profileMap.get(log.actor_id)
                : null;

              const currentData =
                log.after_data ??
                log.before_data;

              const entityName =
                typeof currentData?.name === "string"
                  ? currentData.name
                  : log.entity_id;

              return (
                <article
                  key={log.id}
                  className="p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e5f3ed] px-3 py-1 text-xs font-semibold text-[#0c5142]">
                          {getActionLabel(log.action)}
                        </span>

                        <span className="text-sm font-semibold capitalize">
                          {log.entity_type}
                        </span>
                      </div>

                      <p className="mt-3 font-medium">
                        {entityName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Oleh{" "}
                        {actor?.full_name ??
                          "Sistem atau administrator"}
                        {actor?.role
                          ? ` · ${actor.role}`
                          : ""}
                      </p>
                    </div>

                    <time className="text-sm text-slate-500">
                      {formatDate(log.created_at)}
                    </time>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-[#146b58]">
                      Lihat detail perubahan
​NOTION_TWS[                    ]NOTION_TWS​

                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <DataBlock
                        label="Sebelum"
                        data={log.before_data}
                      />

                      <DataBlock
                        label="Sesudah"
                        data={log.after_data}
                      />
                    </div>
                    </summary>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function DataBlock({
  label,
  data,
}: {
  label: string;
  data: Record<string, unknown> | null;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-950 p-4 text-slate-100">
      <p className="mb-3 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <pre className="overflow-x-auto text-xs leading-6">
        {data
          ? JSON.stringify(data, null, 2)
          : "Tidak ada data"}
      </pre>
    </div>
  );
        }
        