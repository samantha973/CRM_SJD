// Shared badge styling for pipeline + order statuses. Plain data so both
// server and client components can import it.

export const contactStatusStyles: Record<string, string> = {
  new_lead: "bg-mint/20 text-charcoal border-mint/40",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  discovery_call: "bg-indigo-50 text-indigo-700 border-indigo-200",
  proposal: "bg-amber-50 text-amber-700 border-amber-200",
  won: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export const orderStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export const contactStatusStyle = (s: string) =>
  contactStatusStyles[s] ?? "border-neutral-200 bg-neutral-50 text-neutral-600";
export const orderStatusStyle = (s: string) =>
  orderStatusStyles[s] ?? "border-neutral-200 bg-neutral-50 text-neutral-600";
