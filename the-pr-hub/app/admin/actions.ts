"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CONTACT_STATUSES,
  ORDER_STATUSES,
  CURRENCIES,
  type ContactStatus,
  type OrderStatus,
  type Currency,
} from "@/lib/constants";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// The signed-in admin's email, used as the `actor` on the audit trail.
// Every mutating action re-checks auth (defence in depth behind middleware).
async function requireActor(): Promise<string> {
  const auth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");
  return user.email ?? user.id;
}

export type ActionState = { ok?: boolean; error?: string };

/**
 * Move one inquiry (Contacts row) to a new pipeline stage and write exactly
 * one activity_log row capturing from_status → to_status and who did it.
 * A no-op (same status) is ignored so the log stays meaningful.
 */
export async function updateContactStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireActor();

  const contactId = String(formData.get("contact_id") || "");
  const toStatus = String(formData.get("to_status") || "");
  const note = String(formData.get("note") || "").trim();

  if (!contactId) return { error: "Missing inquiry." };
  if (!CONTACT_STATUSES.includes(toStatus as ContactStatus)) {
    return { error: "Unknown stage." };
  }

  const supabase = createAdminClient();

  const { data: current, error: readErr } = await supabase
    .from("contacts")
    .select("id, status, person_id")
    .eq("id", contactId)
    .maybeSingle();

  if (readErr || !current) return { error: "Inquiry not found." };

  const fromStatus = current.status as string;

  // Same stage and no note to record → nothing to do.
  if (fromStatus === toStatus && !note) {
    return { ok: true };
  }

  if (fromStatus !== toStatus) {
    const { error: updErr } = await supabase
      .from("contacts")
      .update({ status: toStatus })
      .eq("id", contactId);
    if (updErr) return { error: "Could not update the stage." };
  }

  const { error: logErr } = await supabase.from("activity_log").insert({
    contact_id: contactId,
    person_id: current.person_id,
    from_status: fromStatus,
    to_status: toStatus,
    actor,
    note: note || null,
  });
  if (logErr) return { error: "Stage updated, but the activity log failed." };

  revalidatePath("/admin");
  revalidatePath(`/admin/people/${current.person_id}`);
  return { ok: true };
}

/**
 * Record an order against a person. Amount is entered by the operator in
 * whole currency units (dollars) and stored as integer cents.
 */
export async function addOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireActor();

  const personId = String(formData.get("person_id") || "");
  const productName = String(formData.get("product_name") || "").trim();
  const amountRaw = String(formData.get("amount") || "").trim();
  const currency = String(formData.get("currency") || "AUD");
  const status = String(formData.get("status") || "pending");

  if (!personId) return { error: "Missing person." };
  if (!productName) return { error: "Add what they bought." };
  if (!CURRENCIES.includes(currency as Currency)) {
    return { error: "Unknown currency." };
  }
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return { error: "Unknown order status." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a valid amount." };
  }
  const amountCents = Math.round(amount * 100);

  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").insert({
    person_id: personId,
    product_name: productName,
    amount_cents: amountCents,
    currency,
    status,
  });
  if (error) return { error: "Could not save the order." };

  revalidatePath(`/admin/people/${personId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
