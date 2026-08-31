# Product plan · The PR Hub

## What we're actually building and why

In one sentence: after this exists, every lead — inbound, referred, or
cold — lands in one place the moment it arrives and can be picked up and
moved forward by anyone on the team, so The PR Hub stops depending on the
founder to catch, sort, and chase new business by hand.

Who it's for: the operator is a trained lead-manager seat (today the
senior account director, by design anyone capable), not the founder — the
whole point is to take intake off Samantha. The person on the other side
of the form is a founder-led, high-growth business exploring PR: an
ongoing partnership, a defined project, a speaking or partnership approach,
or a media enquiry.

What we are deliberately NOT building: no affiliates, no subscriptions,
no cohorts, no analytics dashboards, no integrations beyond what's named
here. No discovery-call transcription or AI call-analysis — that is a
separate workflow that runs after a lead is captured, and it is out of
scope today. If it isn't load-bearing for capturing and working a lead,
it's out.

## The brief (drives every /goal command)

You are my engineering partner for building my CRM today. The stack is
already installed and wired (Next.js on Vercel, Supabase, Resend, domain).
Do not reinstall or reprovision anything. Build the app with two surfaces:
a public marketing site that captures leads, and an /admin CRM.
The /admin section is open and unprotected at first; it gets locked
down with email-and-password Supabase Auth later in the build. Do
not add any auth, login page, or route protection until I explicitly
ask for it.

The CRM has exactly four parts:

- People: a contact directory, one row per person, deduplicated by
  email. Columns: id, email (unique), name, phone, company, role,
  source_site, ok_to_contact, attributes (jsonb), created_at,
  updated_at. The custom attributes I named go inside attributes.
  The keys are my attribute names and the values match the types I
  specified.

- Contacts: an inquiry pipeline. Each inquiry links to a person and
  moves through stages new_lead, contacted, discovery_call,
  proposal, won, lost. Columns: id, person_id, type, subject,
  message, source, status, metadata (jsonb), created_at. The type
  field is constrained to exactly the inquiry types I gave in Q4
  (lowercased).

- activity_log: every status change on a Contacts row writes one row
  here. Columns: id, contact_id, person_id, from_status, to_status,
  actor, note, created_at.

- Orders: what people bought. Columns: id, person_id, product_name,
  amount_cents, currency, status (pending, paid, refunded,
  cancelled), created_at.

- Newsletter: people who opted in to email, tracked by
  people.ok_to_contact = true. No separate table.

Conventions:
- Upsert people by email; never duplicate a person.
- Access Supabase server-side with the service key; never expose
  secrets to the client; keys live in environment variables only.
- Keep it simple: no affiliates, no subscriptions, no cohorts.
- Work one step at a time and wait for my approval before each step.

My business: The PR Hub — a strategic PR and corporate communications
advisory firm for founder-led, high-growth technology-enabled businesses.
We turn commercial performance, leadership expertise and company milestones
into external credibility that wins confidence from customers, partners,
talent and investors. In short: we make founders and their businesses
famous, in service of what the business is trying to achieve.
My inquiry types (contacts.type enum): ongoing_partnership, project,
speaking_workshop, strategic_partnership, media_other
  (Lead source is a SEPARATE field, not a type: existing_client,
  former_client, eo_network, event, website, outbound, strategic_partner,
  referral. A referred prospect can still want any of the types above.
  For media_other, an enquiry subtype for routing rides in metadata.)
My design system: Minimalist Apple — clean, lots of white space, calm,
premium; the mint accent is used sparingly as a single confident pop,
never a wash.
My brand colors: Accent mint/teal #8FE0C6, Ink #111111, Charcoal surface
#282828, Background #FFFFFF.
My custom attributes (people.attributes jsonb keys):
  - business_stage — pick-from-a-list: Startup / Scale-up / Established / Enterprise
  - why_now — pick-from-a-list (buying trigger): Capital raise / M&A /
    Expansion / Founder profile / Rebrand-reposition / Other
  - next_follow_up — a date
My domain: theprhub.com.au

## BUILD 1 (small) — Prove the loop

Goal: A stranger can submit an inquiry on my live site and I can see
that lead inside /admin, on the same day, without anyone touching the
database by hand. This closes the exact gap I named in Q1. It is the
smallest thing that proves the whole system works end to end. Nothing
else matters until this is real.

Scope: the People and Contacts tables with my custom attributes wired
into the jsonb column; a working contact form on the live marketing
site that writes a People row (upserted by email) and a linked Contacts
row; one admin login with a single verified account; one admin page
that lists incoming leads newest first.

Definition of Done (every box must be true):
- The contact form is live on my real domain, not localhost.
- Submitting it creates exactly one People row and one linked Contacts
  row, deduplicated by email on repeat submits.
- My chosen custom attributes are saved correctly inside attributes.
- A new Contacts row lands in status new_lead.
- I can log in to /admin with my one seeded account.
- The admin leads page shows the submission within seconds, newest first.
- I personally run the full flow once: submit as a visitor, log in, see it.

Success Criteria (how we know it's good, not just done):
- From a cold start, I can go submit to visible in under 60 seconds.
- Two submissions from the same email produce one person, not two.
- I can read the lead's name, type, message, and my custom attributes
  on the admin page without opening Supabase.
- No lead can land and go unseen, which is the failure mode I named in Q1.

## BUILD 2 (all) — Make it the system I run the business from

Goal: Turn the proven loop into the place I actually manage relationships
and money. After this, I work leads, record what people bought, and keep
my newsletter list entirely from /admin behind my login, and every new
lead gets an automatic confirmation email. This is what makes my Q2
ninety-day win achievable.

Scope: the rest of the /admin back end behind my login: the full People
directory, all inquiries with working pipeline stages, the Orders list,
and the Newsletter list (ok_to_contact = true). Plus Resend wired so a
confirmation email fires on form submit. Every Contacts status change
writes an activity_log row.

Definition of Done (every box must be true):
- All four parts (People, Contacts, Orders, Newsletter) are visible and
  usable in /admin, and all of /admin sits behind my login.
- I can move a Contacts row through new_lead to contacted to
  discovery_call to proposal to won or lost from the interface.
- Each status change writes one activity_log row with from_status,
  to_status, and actor.
- The People directory is searchable and shows my custom attributes.
- I can add an Orders row against a person and see it on their record.
- The Newsletter list shows everyone with ok_to_contact = true.
- Resend is connected, the sending domain is verified, and a real
  confirmation email arrives after a form submit.

Success Criteria (how we know it's good, not just done):
- I can run a lead from first inquiry to won without leaving /admin or
  touching the database.
- A person's full history (their inquiries, status changes, and orders)
  is visible in one place.
- A test submission produces a confirmation email in the inbox, not spam,
  with my domain as the sender.
- Nothing in /admin is reachable without logging in.
- At my real inquiry volume from Q2 (about 3–4 inbound a week, growing
  with cold outreach, targeting two new customers onboarded per month),
  this keeps up without me dropping to the database by hand.
