// Canonical option lists — mirror the DB CHECK constraints exactly.
// Keep these in sync with supabase/migrations/0001_build1_people_contacts.sql

export const INQUIRY_TYPES = [
  { value: "ongoing_partnership", label: "Ongoing PR partnership" },
  { value: "project", label: "Defined project" },
  { value: "speaking_workshop", label: "Speaking / workshop" },
  { value: "strategic_partnership", label: "Strategic partnership" },
  { value: "media_other", label: "Media / other enquiry" },
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];

// Lead source is a SEPARATE field from inquiry type.
export const LEAD_SOURCES = [
  { value: "website", label: "The PR Hub website" },
  { value: "referral", label: "A referral" },
  { value: "existing_client", label: "Existing client" },
  { value: "former_client", label: "Former client" },
  { value: "eo_network", label: "EO network" },
  { value: "event", label: "An event" },
  { value: "outbound", label: "Outbound / cold outreach" },
  { value: "strategic_partner", label: "Strategic partner" },
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number]["value"];

export const CONTACT_STATUSES = [
  "new_lead",
  "contacted",
  "discovery_call",
  "proposal",
  "won",
  "lost",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

// Custom attributes (people.attributes jsonb keys)
export const BUSINESS_STAGES = [
  "Startup",
  "Scale-up",
  "Established",
  "Enterprise",
] as const;

export const WHY_NOW = [
  "Capital raise",
  "M&A",
  "Expansion",
  "Founder profile",
  "Rebrand-reposition",
  "Other",
] as const;

// Enquiry subtype for media_other — rides in contacts.metadata for routing.
export const MEDIA_SUBTYPES = [
  "Press / journalist enquiry",
  "Podcast / interview",
  "Awards / speaking",
  "General / not sure",
] as const;

export const inquiryTypeLabel = (v: string) =>
  INQUIRY_TYPES.find((t) => t.value === v)?.label ?? v;
export const leadSourceLabel = (v: string) =>
  LEAD_SOURCES.find((t) => t.value === v)?.label ?? v;
