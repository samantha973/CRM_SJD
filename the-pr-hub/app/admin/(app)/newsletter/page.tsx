import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate } from "@/lib/format";
import CopyEmails from "@/components/admin/CopyEmails";

export const dynamic = "force-dynamic";

type Subscriber = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  created_at: string;
};

export default async function NewsletterPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, name, email, company, created_at")
    .eq("ok_to_contact", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  const subs = (data as Subscriber[]) ?? [];
  const emails = subs.map((s) => s.email);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Newsletter</h1>
          <p className="mt-1 text-[14px] text-charcoal/60">
            Everyone who opted in · {subs.length}{" "}
            {subs.length === 1 ? "subscriber" : "subscribers"}
          </p>
        </div>
        {emails.length > 0 && <CopyEmails emails={emails} />}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          Could not load subscribers: {error.message}
        </p>
      )}

      {!error && subs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
          <p className="text-[15px] text-charcoal/60">
            No subscribers yet. People who tick the newsletter box on the contact form
            appear here.
          </p>
        </div>
      )}

      {subs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_20px_-14px_rgba(0,0,0,0.25)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] text-[12px] uppercase tracking-wide text-charcoal/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium text-right">Opted in</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-black/[0.04] transition last:border-0 hover:bg-black/[0.015]"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/people/${s.id}`}
                      className="text-[14px] font-medium text-ink hover:underline"
                    >
                      {s.name || "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-charcoal/80">
                    <a href={`mailto:${s.email}`} className="hover:text-ink hover:underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-charcoal/70">
                    {s.company || <span className="text-charcoal/35">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-charcoal/55">
                    {fmtDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
