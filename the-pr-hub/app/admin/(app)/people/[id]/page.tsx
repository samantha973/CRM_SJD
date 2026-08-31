import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  inquiryTypeLabel,
  leadSourceLabel,
  contactStatusLabel,
  orderStatusLabel,
  formatAmount,
} from "@/lib/constants";
import { contactStatusStyle, orderStatusStyle } from "@/lib/statusStyles";
import { fmtDate, fmtDateTime } from "@/lib/format";
import StatusControl from "@/components/admin/StatusControl";
import AddOrderForm from "@/components/admin/AddOrderForm";

export const dynamic = "force-dynamic";

type Person = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  source_site: string | null;
  ok_to_contact: boolean;
  attributes: Record<string, unknown> | null;
  created_at: string;
};

type Contact = {
  id: string;
  type: string;
  subject: string | null;
  message: string | null;
  source: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Order = {
  id: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

type Activity = {
  id: string;
  from_status: string | null;
  to_status: string;
  actor: string | null;
  note: string | null;
  created_at: string;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] uppercase tracking-wide text-charcoal/45">{label}</dt>
      <dd className="mt-0.5 text-[14px] text-ink">{value || <span className="text-charcoal/35">—</span>}</dd>
    </div>
  );
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: person } = await supabase
    .from("people")
    .select(
      "id, email, name, phone, company, role, source_site, ok_to_contact, attributes, created_at",
    )
    .eq("id", id)
    .maybeSingle<Person>();

  if (!person) notFound();

  const [{ data: contactsData }, { data: ordersData }, { data: activityData }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id, type, subject, message, source, status, metadata, created_at")
        .eq("person_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, product_name, amount_cents, currency, status, created_at")
        .eq("person_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("id, from_status, to_status, actor, note, created_at")
        .eq("person_id", id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const contacts = (contactsData as Contact[]) ?? [];
  const orders = (ordersData as Order[]) ?? [];
  const activity = (activityData as Activity[]) ?? [];

  const attrs = (person.attributes ?? {}) as Record<string, unknown>;
  const nextFollowUp =
    typeof attrs.next_follow_up === "string" ? attrs.next_follow_up : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/admin/people"
        className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-charcoal/60 transition hover:text-ink"
      >
        ← People
      </Link>

      {/* Identity card */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_20px_-14px_rgba(0,0,0,0.25)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {person.name || person.email}
            </h1>
            {person.company && (
              <p className="mt-0.5 text-[15px] text-charcoal/70">
                {person.company}
                {person.role && <span className="text-charcoal/45"> · {person.role}</span>}
              </p>
            )}
          </div>
          {person.ok_to_contact && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-[12px] font-medium text-green-700">
              Newsletter subscriber
            </span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field
            label="Email"
            value={
              <a href={`mailto:${person.email}`} className="hover:underline">
                {person.email}
              </a>
            }
          />
          <Field label="Phone" value={person.phone} />
          <Field label="Business stage" value={attrs.business_stage as string} />
          <Field label="Why now" value={attrs.why_now as string} />
          <Field label="Next follow-up" value={nextFollowUp ? fmtDate(nextFollowUp) : null} />
          <Field label="Source site" value={person.source_site} />
          <Field label="Added" value={fmtDate(person.created_at)} />
        </dl>
      </div>

      {/* Inquiries */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">
          Inquiries <span className="text-charcoal/40">· {contacts.length}</span>
        </h2>
        {contacts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-[14px] text-charcoal/55">
            No inquiries on record.
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => {
              const meta = (c.metadata ?? {}) as Record<string, unknown>;
              return (
                <article
                  key={c.id}
                  className="rounded-2xl border border-black/[0.07] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span
                        className={`rounded-full border px-2.5 py-1 font-medium ${contactStatusStyle(
                          c.status,
                        )}`}
                      >
                        {contactStatusLabel(c.status)}
                      </span>
                      <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal">
                        {inquiryTypeLabel(c.type)}
                      </span>
                      {c.source && (
                        <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal/70">
                          {leadSourceLabel(c.source)}
                        </span>
                      )}
                      {typeof meta.enquiry_subtype === "string" && (
                        <span className="rounded-md bg-ink/[0.04] px-2 py-1 text-charcoal/70">
                          {meta.enquiry_subtype}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-charcoal/40">
                      {fmtDateTime(c.created_at)}
                    </span>
                  </div>
                  {c.subject && (
                    <p className="mt-3 text-[14px] font-medium text-ink">{c.subject}</p>
                  )}
                  {c.message && (
                    <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-charcoal/80">
                      {c.message}
                    </p>
                  )}
                  <div className="mt-4 border-t border-black/[0.06] pt-3.5">
                    <StatusControl contactId={c.id} current={c.status} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">
            Orders <span className="text-charcoal/40">· {orders.length}</span>
          </h2>
          <AddOrderForm personId={person.id} />
        </div>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-[14px] text-charcoal/55">
            No orders recorded yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <table className="w-full text-left">
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-black/[0.04] last:border-0">
                    <td className="px-5 py-3.5 text-[14px] font-medium text-ink">
                      {o.product_name}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-charcoal/80">
                      {formatAmount(o.amount_cents, o.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${orderStatusStyle(
                          o.status,
                        )}`}
                      >
                        {orderStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[12px] text-charcoal/45">
                      {fmtDate(o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity timeline */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Activity</h2>
        {activity.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-[14px] text-charcoal/55">
            No stage changes logged yet.
          </p>
        ) : (
          <ol className="space-y-3 border-l border-black/[0.08] pl-5">
            {activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-mint ring-4 ring-[#FAFAFA]" />
                <div className="text-[13.5px] text-ink">
                  {a.from_status ? (
                    <>
                      {contactStatusLabel(a.from_status)} →{" "}
                      <span className="font-medium">{contactStatusLabel(a.to_status)}</span>
                    </>
                  ) : (
                    <span className="font-medium">{contactStatusLabel(a.to_status)}</span>
                  )}
                </div>
                {a.note && <p className="mt-0.5 text-[13px] text-charcoal/70">{a.note}</p>}
                <p className="mt-0.5 text-[12px] text-charcoal/40">
                  {fmtDateTime(a.created_at)}
                  {a.actor && <span> · {a.actor}</span>}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
