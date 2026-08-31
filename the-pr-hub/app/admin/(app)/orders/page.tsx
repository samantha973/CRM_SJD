import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderStatusLabel, formatAmount } from "@/lib/constants";
import { orderStatusStyle } from "@/lib/statusStyles";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  person: { id: string; name: string | null; email: string; company: string | null } | null;
};

export default async function OrdersPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, product_name, amount_cents, currency, status, created_at, person:people(id, name, email, company)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const orders = (data as unknown as OrderRow[]) ?? [];

  // Sum paid orders per currency for a quick revenue read.
  const paidByCurrency = orders
    .filter((o) => o.status === "paid")
    .reduce<Record<string, number>>((acc, o) => {
      acc[o.currency] = (acc[o.currency] ?? 0) + o.amount_cents;
      return acc;
    }, {});
  const paidSummary = Object.entries(paidByCurrency)
    .map(([cur, cents]) => formatAmount(cents, cur))
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Orders</h1>
        <p className="mt-1 text-[14px] text-charcoal/60">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
          {paidSummary && <span> · {paidSummary} paid</span>}
          <span className="text-charcoal/40"> · add orders from a person’s record</span>
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          Could not load orders: {error.message}
        </p>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
          <p className="text-[15px] text-charcoal/60">
            No orders yet. Open a person in{" "}
            <Link href="/admin/people" className="underline hover:text-ink">
              People
            </Link>{" "}
            and add one against their record.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_20px_-14px_rgba(0,0,0,0.25)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] text-[12px] uppercase tracking-wide text-charcoal/50">
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-black/[0.04] transition last:border-0 hover:bg-black/[0.015]"
                >
                  <td className="px-5 py-3.5">
                    {o.person ? (
                      <Link href={`/admin/people/${o.person.id}`} className="group block">
                        <span className="text-[14px] font-medium text-ink group-hover:underline">
                          {o.person.name || o.person.email}
                        </span>
                        {o.person.company && (
                          <span className="block text-[12px] text-charcoal/50">
                            {o.person.company}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-charcoal/35">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] text-charcoal/80">{o.product_name}</td>
                  <td className="px-5 py-3.5 text-[14px] font-medium text-ink">
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
                  <td className="px-5 py-3.5 text-right text-[13px] text-charcoal/55">
                    {fmtDate(o.created_at)}
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
