import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  contactStatusLabel,
  formatAmount,
  CONTACT_STATUSES,
} from "@/lib/constants";
import { contactStatusStyle } from "@/lib/statusStyles";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Contact = {
  id: string;
  status: string;
  created_at: string;
  person: { id: string; name: string | null; company: string | null } | null;
};
type Person = {
  id: string;
  name: string | null;
  company: string | null;
  attributes: Record<string, unknown> | null;
};
type Activity = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
  person: { id: string; name: string | null; company: string | null } | null;
};
type Order = {
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

// Open stages = still in play (everything except won/lost).
const OPEN_STAGES = CONTACT_STATUSES.filter((s) => s !== "won" && s !== "lost");

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseFollowUp(v: unknown): Date | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return new Date(v + "T00:00:00");
}

function StatCard({
  label,
  value,
  sub,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "mint" | "warn";
  href?: string;
}) {
  const ring =
    tone === "mint"
      ? "border-mint/50 bg-mint/[0.08]"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50/60"
        : "border-black/[0.07] bg-white";
  const inner = (
    <div className={`rounded-2xl border ${ring} p-5 shadow-[0_1px_20px_-16px_rgba(0,0,0,0.3)]`}>
      <p className="text-[12px] font-medium uppercase tracking-wide text-charcoal/50">{label}</p>
      <p className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-2 text-[12.5px] text-charcoal/55">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const [{ data: cData }, { data: pData }, { data: aData }, { data: oData }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id, status, created_at, person:people(id, name, company)")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("people")
        .select("id, name, company, attributes")
        .limit(2000),
      supabase
        .from("activity_log")
        .select("id, from_status, to_status, note, created_at, person:people(id, name, company)")
        .order("created_at", { ascending: false })
        .limit(80),
      supabase.from("orders").select("amount_cents, currency, status, created_at").limit(1000),
    ]);

  const contacts = (cData as unknown as Contact[]) ?? [];
  const people = (pData as unknown as Person[]) ?? [];
  const activity = (aData as unknown as Activity[]) ?? [];
  const orders = (oData as Order[]) ?? [];

  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = new Date(today.getTime() - 7 * 864e5);
  const weekAhead = new Date(today.getTime() + 7 * 864e5);
  const within7 = (iso: string) => new Date(iso) >= weekAgo;

  // --- Weekly momentum ---
  const newThisWeek = contacts.filter((c) => within7(c.created_at)).length;
  const movesThisWeek = activity.filter((a) => within7(a.created_at));
  const wonThisWeek = movesThisWeek.filter((a) => a.to_status === "won").length;
  const lostThisWeek = movesThisWeek.filter((a) => a.to_status === "lost").length;

  const openCount = contacts.filter((c) => OPEN_STAGES.includes(c.status as never)).length;

  // --- Follow-ups (the weekly action signal) ---
  // Latest open-inquiry stage per person, to badge the attention list.
  const openStageByPerson = new Map<string, string>();
  for (const c of contacts) {
    if (!c.person) continue;
    if (OPEN_STAGES.includes(c.status as never) && !openStageByPerson.has(c.person.id)) {
      openStageByPerson.set(c.person.id, c.status);
    }
  }
  type FollowUp = { person: Person; due: Date; overdue: boolean; stage: string | null };
  const followUps: FollowUp[] = [];
  for (const p of people) {
    const due = parseFollowUp((p.attributes ?? {}).next_follow_up);
    if (!due) continue;
    if (due > weekAhead) continue; // only overdue + due this week matter now
    followUps.push({
      person: p,
      due,
      overdue: due < today,
      stage: openStageByPerson.get(p.id) ?? null,
    });
  }
  followUps.sort((a, b) => a.due.getTime() - b.due.getTime());
  const overdueCount = followUps.filter((f) => f.overdue).length;
  const dueThisWeekCount = followUps.length - overdueCount;

  // --- Revenue ---
  const paidCents = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + o.amount_cents, 0);
  const pendingCents = orders
    .filter((o) => o.status === "pending")
    .reduce((s, o) => s + o.amount_cents, 0);

  // --- Funnel ---
  const funnel = OPEN_STAGES.map((s) => ({
    stage: s,
    count: contacts.filter((c) => c.status === s).length,
  }));
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));

  const weekLabel = `${fmtDate(weekAgo.toISOString())} – ${fmtDate(now.toISOString())}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">This week</h1>
          <p className="mt-1 text-[14px] text-charcoal/60">
            Your weekly read on the pipeline · {weekLabel}
          </p>
        </div>
        <Link
          href="/admin/inbox"
          className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white transition hover:bg-charcoal"
        >
          Open inbox →
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="New leads · 7d" value={newThisWeek} href="/admin/inbox?status=new_lead" />
        <StatCard label="Open inquiries" value={openCount} sub="in play now" href="/admin/inbox" />
        <StatCard
          label="Due this week"
          value={dueThisWeekCount}
          tone="mint"
          sub="follow-ups scheduled"
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          tone={overdueCount > 0 ? "warn" : "default"}
          sub="need chasing"
        />
        <StatCard label="Won · 7d" value={wonThisWeek} sub={`${lostThisWeek} lost`} />
        <StatCard
          label="Paid revenue"
          value={formatAmount(paidCents, "AUD")}
          sub={`${formatAmount(pendingCents, "AUD")} pending`}
          href="/admin/orders"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Needs attention — the weekly action list */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Needs your attention</h2>
            <span className="text-[12px] text-charcoal/45">
              {followUps.length} follow-up{followUps.length === 1 ? "" : "s"}
            </span>
          </div>
          {followUps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center text-[14px] text-charcoal/55">
              Nothing due this week. Set a “next follow-up” on a person to have them surface here.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_20px_-16px_rgba(0,0,0,0.3)]">
              {followUps.slice(0, 12).map((f) => (
                <Link
                  key={f.person.id}
                  href={`/admin/people/${f.person.id}`}
                  className="flex items-center justify-between gap-3 border-b border-black/[0.05] px-5 py-3.5 transition last:border-0 hover:bg-black/[0.015]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">
                      {f.person.name || "—"}
                      {f.person.company && (
                        <span className="font-normal text-charcoal/45"> · {f.person.company}</span>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {f.stage && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${contactStatusStyle(
                            f.stage,
                          )}`}
                        >
                          {contactStatusLabel(f.stage)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-[13px] font-medium ${
                        f.overdue ? "text-red-600" : "text-charcoal/80"
                      }`}
                    >
                      {f.overdue ? "Overdue" : "Due"}
                    </p>
                    <p className="text-[12px] text-charcoal/45">{fmtDate(f.due.toISOString())}</p>
                  </div>
                </Link>
              ))}
              {followUps.length > 12 && (
                <div className="px-5 py-2.5 text-center text-[12px] text-charcoal/45">
                  + {followUps.length - 12} more due
                </div>
              )}
            </div>
          )}
        </section>

        {/* Pipeline funnel + momentum */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Pipeline</h2>
          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_20px_-16px_rgba(0,0,0,0.3)]">
            <div className="space-y-3">
              {funnel.map((f) => (
                <Link
                  key={f.stage}
                  href={`/admin/inbox?status=${f.stage}`}
                  className="group block"
                >
                  <div className="mb-1 flex items-center justify-between text-[12.5px]">
                    <span className="text-charcoal/70 group-hover:text-ink">
                      {contactStatusLabel(f.stage)}
                    </span>
                    <span className="font-medium text-ink">{f.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]">
                    <div
                      className="h-full rounded-full bg-charcoal/70 transition-all group-hover:bg-ink"
                      style={{ width: `${(f.count / funnelMax) * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-4 text-center">
              <div>
                <p className="text-[18px] font-semibold text-ink">{newThisWeek}</p>
                <p className="text-[11px] text-charcoal/50">new · 7d</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-ink">{movesThisWeek.length}</p>
                <p className="text-[11px] text-charcoal/50">moved · 7d</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-ink">{wonThisWeek}</p>
                <p className="text-[11px] text-charcoal/50">won · 7d</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Recent activity</h2>
        {movesThisWeek.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-[14px] text-charcoal/55">
            No stage changes in the last 7 days.
          </div>
        ) : (
          <ol className="space-y-2.5 border-l border-black/[0.08] pl-5">
            {movesThisWeek.slice(0, 12).map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-mint ring-4 ring-[#FAFAFA]" />
                <div className="text-[13.5px] text-ink">
                  {a.person ? (
                    <Link href={`/admin/people/${a.person.id}`} className="font-medium hover:underline">
                      {a.person.name || "—"}
                    </Link>
                  ) : (
                    <span className="font-medium">—</span>
                  )}{" "}
                  <span className="text-charcoal/60">
                    {a.from_status ? (
                      <>
                        moved {contactStatusLabel(a.from_status)} → {contactStatusLabel(a.to_status)}
                      </>
                    ) : (
                      <>set to {contactStatusLabel(a.to_status)}</>
                    )}
                  </span>
                </div>
                <p className="text-[12px] text-charcoal/40">
                  {fmtDateTime(a.created_at)}
                  {a.note && <span className="text-charcoal/55"> · {a.note}</span>}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
