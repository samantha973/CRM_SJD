import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate } from "@/lib/format";
import SearchBar from "@/components/admin/SearchBar";

export const dynamic = "force-dynamic";

type PersonRow = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  role: string | null;
  phone: string | null;
  ok_to_contact: boolean;
  attributes: Record<string, unknown> | null;
  created_at: string;
  contacts: { count: number }[];
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const supabase = createAdminClient();
  let query = supabase
    .from("people")
    .select(
      "id, name, email, company, role, phone, ok_to_contact, attributes, created_at, contacts(count)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (term) {
    // Case-insensitive match across the fields the operator would search by.
    const like = `%${term}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},company.ilike.${like}`,
    );
  }

  const { data, error } = await query;
  const people = (data as unknown as PersonRow[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">People</h1>
          <p className="mt-1 text-[14px] text-charcoal/60">
            {term ? (
              <>
                {people.length} {people.length === 1 ? "match" : "matches"} for “{term}”
              </>
            ) : (
              <>
                Your full contact directory · {people.length}{" "}
                {people.length === 1 ? "person" : "people"}
              </>
            )}
          </p>
        </div>
        <SearchBar
          action="/admin/people"
          initial={term}
          placeholder="Search name, email, company…"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          Could not load people: {error.message}
        </p>
      )}

      {!error && people.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
          <p className="text-[15px] text-charcoal/60">
            {term ? "No one matches that search." : "No people yet."}
          </p>
        </div>
      )}

      {people.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_20px_-14px_rgba(0,0,0,0.25)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] text-[12px] uppercase tracking-wide text-charcoal/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Stage / trigger</th>
                <th className="px-5 py-3 font-medium">Inquiries</th>
                <th className="px-5 py-3 font-medium">List</th>
                <th className="px-5 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const attrs = (p.attributes ?? {}) as Record<string, unknown>;
                const inquiries = p.contacts?.[0]?.count ?? 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-black/[0.04] transition last:border-0 hover:bg-black/[0.015]"
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/people/${p.id}`} className="group block">
                        <span className="text-[14px] font-medium text-ink group-hover:underline">
                          {p.name || "—"}
                        </span>
                        <span className="block text-[12.5px] text-charcoal/55">{p.email}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-charcoal/80">
                      {p.company || <span className="text-charcoal/35">—</span>}
                      {p.role && (
                        <span className="block text-[12px] text-charcoal/45">{p.role}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {typeof attrs.business_stage === "string" && (
                          <span className="rounded-md bg-mint/15 px-2 py-0.5 text-[12px] text-charcoal">
                            {attrs.business_stage as string}
                          </span>
                        )}
                        {typeof attrs.why_now === "string" && (
                          <span className="rounded-md bg-ink/[0.04] px-2 py-0.5 text-[12px] text-charcoal/70">
                            {attrs.why_now as string}
                          </span>
                        )}
                        {!attrs.business_stage && !attrs.why_now && (
                          <span className="text-[12px] text-charcoal/35">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-charcoal/80">{inquiries}</td>
                    <td className="px-5 py-3.5">
                      {p.ok_to_contact ? (
                        <span className="rounded-md bg-green-50 px-2 py-0.5 text-[12px] text-green-700">
                          Subscribed
                        </span>
                      ) : (
                        <span className="text-[12px] text-charcoal/35">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-charcoal/55">
                      {fmtDate(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
