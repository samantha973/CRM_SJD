import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  INQUIRY_TYPES,
  LEAD_SOURCES,
  BUSINESS_STAGES,
  WHY_NOW,
} from "@/lib/constants";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  const company = str(body.company);
  const role = str(body.role);
  const type = str(body.type);
  const subject = str(body.subject);
  const message = str(body.message);
  const businessStage = str(body.business_stage);
  const whyNow = str(body.why_now);
  const mediaSubtype = str(body.media_subtype);
  const okToContact = body.ok_to_contact === "true" || body.ok_to_contact === true;

  // Source is a separate field from type; default to the website.
  let source = str(body.source) || "website";

  // --- Validation ---
  if (!name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Please add a valid email." }, { status: 400 });
  if (!message)
    return NextResponse.json({ error: "Please add a short message." }, { status: 400 });
  if (!INQUIRY_TYPES.some((t) => t.value === type))
    return NextResponse.json({ error: "Please choose what we can help with." }, { status: 400 });
  if (!LEAD_SOURCES.some((s) => s.value === source)) source = "website";

  // --- Custom attributes (people.attributes jsonb) ---
  const newAttributes: Record<string, unknown> = {};
  if (BUSINESS_STAGES.includes(businessStage as (typeof BUSINESS_STAGES)[number]))
    newAttributes.business_stage = businessStage;
  if (WHY_NOW.includes(whyNow as (typeof WHY_NOW)[number]))
    newAttributes.why_now = whyNow;

  const supabase = createAdminClient();

  // --- Upsert the person by email (never duplicate) ---
  const { data: existing, error: lookupErr } = await supabase
    .from("people")
    .select("id, attributes")
    .eq("email", email)
    .maybeSingle();

  if (lookupErr) {
    console.error("people lookup failed", lookupErr);
    return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
  }

  let personId: string;

  if (existing) {
    const mergedAttributes = {
      ...(existing.attributes as Record<string, unknown>),
      ...newAttributes,
    };
    // Only overwrite fields the visitor actually provided this time.
    const update: Record<string, unknown> = {
      attributes: mergedAttributes,
      updated_at: new Date().toISOString(),
    };
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (company) update.company = company;
    if (role) update.role = role;
    if (okToContact) update.ok_to_contact = true;

    const { data, error } = await supabase
      .from("people")
      .update(update)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error || !data) {
      console.error("people update failed", error);
      return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
    }
    personId = data.id;
  } else {
    const { data, error } = await supabase
      .from("people")
      .insert({
        email,
        name: name || null,
        phone: phone || null,
        company: company || null,
        role: role || null,
        source_site: "theprhub.com.au",
        ok_to_contact: okToContact,
        attributes: newAttributes,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("people insert failed", error);
      return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
    }
    personId = data.id;
  }

  // --- Insert the linked inquiry (Contacts), always as a new lead ---
  const metadata: Record<string, unknown> = {};
  if (type === "media_other" && mediaSubtype) metadata.enquiry_subtype = mediaSubtype;

  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .insert({
      person_id: personId,
      type,
      subject: subject || null,
      message,
      source,
      status: "new_lead",
      metadata,
    })
    .select("id")
    .single();

  if (contactErr || !contact) {
    console.error("contact insert failed", contactErr);
    return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, person_id: personId, contact_id: contact.id });
}
