import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  inquiryTypeLabel,
  leadSourceLabel,
  contactStatusLabel,
  CONTACT_STATUSES,
} from "@/lib/constants";
import { contactStatusStyle } from "@/lib/statusStyles";
import { fmtDateTime } from "@/lib/format";
import StatusControl from "@/components/admin/StatusControl";

export const dynamic = "force-dynamic";

type Person = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  ok_to_contact: boolean;
  attributes: Record<string, unknown> | null;
};

type Lead = {
  id: string;
  type: string;
  subject: string | null;
  message: string | null;
  source: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  person: Person | null;
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active =
    status && CONTACT_STATUSES.includes(status as (typeof CONTACT_STATUSES)[number])
      ? status
      : "all";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, type, subject, message, source, status, metadata, created_at, person:people(id, name, email, phone, company, ok_to_contact, attributes)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const all = (data as unknown as Lead[]) ?? [];
  const counts = all.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});
  const leads = active === "all" ? all : all.filter((l) => l.status === active);

  const tabs = [
    { key: "all", label: "All", count: all.length },
    ...CONTACT_STATUSES.map((s) => ({
      key: s,
      label: contactStatusLabel(s),
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Inbox</h1>
        <p className="mt-1 text-[14px] text-charcoal/60">
          Every inquiry, newest first. Move each one through the pipeline.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const href = t.key === "all" ? "/admin/inbox" : `/admin/inbox?status=${t.key}`;
          const on = active === t.key;
          return (
            <Link
              key={t.key}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-black/10 bg-white text-charcoal/70 hover:border-black/25"
              }`}
            >
              {t.label}
              <span className={on ? "text-white/60" : "text-charcoal/40"}>{t.count}</span>
            </Link>
          );
        })}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          Could not load inquiries: {error.message}
        </p>
      )}

      {!error && leads.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
          <p className="text-[15px] text-charcoal/60">
            {active === "all"
              ? "No inquiries yet. Submit the contact form on the site and it will appear here."
              : `Nothing in ${contactStatusLabel(active)} right now.`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {leads.map((lead) => {
          const p = lead.person;
          const attrs = (p?.attributes ?? {}) as Record<string, unknown>;
          const meta = (lead.metadata ?? {}) as Record<string, unknown>;
          return (
            <article
              key={lead.id}
              className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_20px_-14px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold text-ink">
                    {p ? (
                      <Link href={`/admin/people/${p.id}`} className="hover:underline">
                        {p.name || p.email}
                      </Link>
                    ) : (
                      "—"
                    )}
                    {p?.company && (
                      <span className="font-normal text-charcoal/50"> · {p.company}</span>
                    )}
                  </h2>
                  <p className="mt-0.5 text-[14px] text-charcoal/70">
                    <a href={`mailto:${p?.email}`} className="hover:text-ink hover:underline">
                      {p?.email}
                    </a>
                    {p?.phone && <span className="text-charcoal/50"> · {p.phone}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${contactStatusStyle(
                      lead.status,
                    )}`}
                  >
                    {contactStatusLabel(lead.status)}
                  </span>
                  <span className="text-[12px] text-charcoal/40">
                    {fmtDateTime(lead.created_at)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal">
                  {inquiryTypeLabel(lead.type)}
                </span>
                {lead.source && (
                  <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal/70">
                    Source: {leadSourceLabel(lead.source)}
                  </span>
                )}
                {typeof meta.enquiry_subtype === "string" && (
                  <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal/70">
                    {meta.enquiry_subtype}
                  </span>
                )}
                {typeof attrs.business_stage === "string" && (
                  <span className="rounded-md bg-mint/15 px-2 py-1 text-charcoal">
                    {attrs.business_stage as string}
                  </span>
                )}
                {typeof attrs.why_now === "string" && (
                  <span className="rounded-md bg-mint/15 px-2 py-1 text-charcoal">
                    Why now: {attrs.why_now as string}
                  </span>
                )}
                {p?.ok_to_contact && (
                  <span className="rounded-md bg-green-50 px-2 py-1 text-green-700">
                    Newsletter opt-in
                  </span>
                )}
              </div>

              {lead.subject && (
                <p className="mt-4 text-[14px] font-medium text-ink">{lead.subject}</p>
              )}
              {lead.message && (
                <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-charcoal/80">
                  {lead.message}
                </p>
              )}

              <div className="mt-5 border-t border-black/[0.06] pt-4">
                <StatusControl contactId={lead.id} current={lead.status} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
