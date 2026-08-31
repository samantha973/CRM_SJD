import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inquiryTypeLabel, leadSourceLabel } from "@/lib/constants";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

type Person = {
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

const statusStyles: Record<string, string> = {
  new_lead: "bg-mint/20 text-charcoal border-mint/40",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  discovery_call: "bg-indigo-50 text-indigo-700 border-indigo-200",
  proposal: "bg-amber-50 text-amber-700 border-amber-200",
  won: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLeadsPage() {
  // Guard (middleware already protects, this is defence in depth).
  const auth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, type, subject, message, source, status, metadata, created_at, person:people(name, email, phone, company, ok_to_contact, attributes)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const leads = (data as unknown as Lead[]) ?? [];

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-3 w-3 rounded-full bg-mint" />
            <span className="text-[16px] font-semibold tracking-tight text-ink">
              The PR Hub · Leads
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-charcoal/50 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button className="rounded-full border border-black/10 px-3.5 py-1.5 text-[13px] font-medium text-charcoal transition hover:border-black/25">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Incoming leads</h1>
            <p className="mt-1 text-[14px] text-charcoal/60">
              Newest first · {leads.length} {leads.length === 1 ? "lead" : "leads"}
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            Could not load leads: {error.message}
          </p>
        )}

        {!error && leads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
            <p className="text-[15px] text-charcoal/60">
              No leads yet. Submit the contact form on the site and it will appear here.
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
                      {p?.name || "—"}
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
                      className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${
                        statusStyles[lead.status] ?? "border-neutral-200 bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {lead.status.replace("_", " ")}
                    </span>
                    <span className="text-[12px] text-charcoal/40">{fmtDate(lead.created_at)}</span>
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
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
