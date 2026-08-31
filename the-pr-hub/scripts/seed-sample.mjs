// Seed ~100 realistic SAMPLE records into the CRM, or remove them again.
//
//   node scripts/seed-sample.mjs         # insert sample data
//   node scripts/seed-sample.mjs --clean # delete ALL sample data
//
// Every sample row is tagged so it is trivially reversible and never mixes
// with real leads:
//   people.source_site   = 'sample-data'
//   people.attributes.sample = true
//   people.email         = sample.NN@demo.theprhub.test
// Clean-up deletes people WHERE source_site = 'sample-data'; contacts, orders
// and activity_log cascade from the people foreign keys.
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Service-role key stays local; never printed, never committed.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- env ---------------------------------------------------------------
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  } catch {}
  return { ...env, ...process.env };
}
const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function rest(method, path, body, prefer) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...H, Prefer: prefer } : H,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- helpers -----------------------------------------------------------
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const chance = (p) => Math.random() < p;
const isoDaysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();
const dateDaysFromNow = (d) =>
  new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);

const FIRST = ["Amara","Ben","Chloe","Dev","Elena","Finn","Grace","Hugo","Isla","Jack","Kira","Liam","Mia","Noah","Olivia","Priya","Quinn","Ravi","Sofia","Tom","Uma","Vik","Wren","Xander","Yara","Zoe","Ada","Marcus","Nadia","Oscar","Paige","Ren","Simone","Theo","Ula","Cameron","Harriet","Julian","Layla","Mateo"];
const LAST = ["Nguyen","Patel","Kelly","Okafor","Rossi","Chen","Murphy","Silva","Kim","Walsh","Haddad","Brooks","Fischer","Costa","Ivanov","Reyes","Fraser","Dubois","Kowalski","Tan","Bianchi","Lund","Mensah","Park","Novak","Ellis","Sato","Ahmed","Gallo","Vance"];
const COMPANY_A = ["North","Lumen","Vertex","Cova","Bright","Orbit","Kindred","Aster","Fathom","Ridge","Cobalt","Meridian","Harbor","Pulse","Nova","Ember","Solace","Tandem","Quill","Beacon"];
const COMPANY_B = ["Labs","Health","Capital","Robotics","Studio","Systems","Foods","Energy","Bio","Ventures","Digital","Group","Collective","AI","Works","Financial","Logistics","Mobility"];
const ROLES = ["Founder & CEO","Co-founder","CEO","CMO","Head of Comms","COO","Chief of Staff","Marketing Lead","Founder"];

const TYPES = ["ongoing_partnership","project","speaking_workshop","strategic_partnership","media_other"];
const SOURCES = ["existing_client","former_client","eo_network","event","website","outbound","strategic_partner","referral"];
const STAGES = ["new_lead","contacted","discovery_call","proposal","won","lost"];
const STAGE_ORDER = ["new_lead","contacted","discovery_call","proposal"];
const BUSINESS_STAGES = ["Startup","Scale-up","Established","Enterprise"];
const WHY_NOW = ["Capital raise","M&A","Expansion","Founder profile","Rebrand-reposition","Other"];
const MEDIA_SUBTYPES = ["Press / journalist enquiry","Podcast / interview","Awards / speaking","General / not sure"];
const PRODUCTS = ["3-month PR retainer","6-month PR retainer","Launch campaign","Thought-leadership program","Media training workshop","Founder profile sprint","Award submission package"];

// Weighted stage distribution so the pipeline looks like a real funnel.
function weightedStage() {
  const r = Math.random();
  if (r < 0.34) return "new_lead";
  if (r < 0.56) return "contacted";
  if (r < 0.71) return "discovery_call";
  if (r < 0.83) return "proposal";
  if (r < 0.92) return "won";
  return "lost";
}

const SAMPLE_MARK = "sample-data";

async function clean() {
  console.log("Removing existing sample data (source_site = sample-data)…");
  const del = await rest(
    "DELETE",
    `people?source_site=eq.${SAMPLE_MARK}`,
    undefined,
    "return=representation",
  );
  console.log(`Deleted ${del?.length ?? 0} sample people (contacts/orders/activity cascaded).`);
}

async function seed() {
  await clean(); // idempotent: never double-seed

  const N = 100;
  console.log(`Seeding ${N} sample people…`);

  // 1) People -----------------------------------------------------------
  const peoplePayload = Array.from({ length: N }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const company = `${pick(COMPANY_A)} ${pick(COMPANY_B)}`;
    const createdDaysAgo = Math.floor(Math.random() * 40); // up to ~6 weeks old
    const attrs = { sample: true };
    if (chance(0.85)) attrs.business_stage = pick(BUSINESS_STAGES);
    if (chance(0.8)) attrs.why_now = pick(WHY_NOW);
    return {
      email: `sample.${String(i + 1).padStart(3, "0")}@demo.theprhub.test`,
      name: `${first} ${last}`,
      phone: chance(0.6) ? `04${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}` : null,
      company,
      role: pick(ROLES),
      source_site: SAMPLE_MARK,
      ok_to_contact: chance(0.4),
      attributes: attrs,
      created_at: isoDaysAgo(createdDaysAgo),
    };
  });

  const people = await rest("POST", "people", peoplePayload, "return=representation");
  console.log(`Inserted ${people.length} people.`);

  // 2) Contacts + activity_log + orders --------------------------------
  const contactsPayload = [];
  const contactMeta = []; // parallel: {personId, stage}
  for (const p of people) {
    const inquiries = chance(0.25) ? 2 : 1;
    for (let k = 0; k < inquiries; k++) {
      const type = pick(TYPES);
      // Newer of a person's inquiries is more recent; ensure a chunk land this week.
      const createdDaysAgo = k === 0 ? Math.floor(Math.random() * 35) : Math.floor(Math.random() * 8);
      const stage = k === 0 ? weightedStage() : "new_lead";
      const metadata = type === "media_other" ? { enquiry_subtype: pick(MEDIA_SUBTYPES), sample: true } : { sample: true };
      contactsPayload.push({
        person_id: p.id,
        type,
        subject: pick(["Exploring PR support","Series A coming up","Launch in Q4","Building founder profile","Rebrand + relaunch","Award season","Podcast tour"]),
        message: `Sample inquiry — ${p.company}. Interested in ${type.replace(/_/g, " ")}.`,
        source: pick(SOURCES),
        status: stage,
        metadata,
        created_at: isoDaysAgo(createdDaysAgo),
      });
      contactMeta.push({ personId: p.id, stage });
    }
  }
  const contacts = await rest("POST", "contacts", contactsPayload, "return=representation");
  console.log(`Inserted ${contacts.length} inquiries.`);

  // Build activity_log: one row per stage the inquiry has passed through,
  // backdated so "moved this week" is meaningful. Also set a next_follow_up
  // on the person for active (non-won/lost) inquiries.
  const activityPayload = [];
  const ordersPayload = [];
  const followUpByPerson = {};

  contacts.forEach((c, idx) => {
    const stage = contactMeta[idx].stage;
    const stageIdx = STAGE_ORDER.indexOf(stage);
    const path = stageIdx >= 0 ? STAGE_ORDER.slice(0, stageIdx + 1) : [...STAGE_ORDER];

    // Progression rows (skip the initial new_lead — that's the create).
    let prev = "new_lead";
    const steps = stage === "won" || stage === "lost" ? [...STAGE_ORDER.slice(1), stage] : path.slice(1);
    steps.forEach((to, i) => {
      // Most recent transitions within the last ~10 days; some this week.
      const daysAgo = Math.max(0, 12 - i * 3 - Math.floor(Math.random() * 4));
      activityPayload.push({
        contact_id: c.id,
        person_id: c.person_id,
        from_status: prev,
        to_status: to,
        actor: "sample@demo.theprhub.test",
        note: chance(0.3) ? pick(["Left a voicemail","Sent intro deck","Great first call","Proposal sent","Following up next week","Budget confirmed"]) : null,
        created_at: isoDaysAgo(daysAgo),
      });
      prev = to;
    });

    // next_follow_up for active inquiries — spread across overdue / this week / later.
    if (!["won", "lost"].includes(stage)) {
      const r = Math.random();
      const offset = r < 0.22 ? -Math.floor(1 + Math.random() * 9) // overdue
        : r < 0.5 ? Math.floor(Math.random() * 7)                  // this week
        : Math.floor(7 + Math.random() * 21);                      // later
      followUpByPerson[c.person_id] = dateDaysFromNow(offset);
    }

    // Orders for won (paid) and some proposal (pending).
    if (stage === "won") {
      ordersPayload.push({
        person_id: c.person_id,
        product_name: pick(PRODUCTS),
        amount_cents: (Math.floor(15 + Math.random() * 90) * 100) * 100, // $1.5k–$10.5k
        currency: "AUD",
        status: chance(0.85) ? "paid" : "pending",
        created_at: isoDaysAgo(Math.floor(Math.random() * 20)),
      });
    } else if (stage === "proposal" && chance(0.4)) {
      ordersPayload.push({
        person_id: c.person_id,
        product_name: pick(PRODUCTS),
        amount_cents: (Math.floor(15 + Math.random() * 90) * 100) * 100,
        currency: "AUD",
        status: "pending",
        created_at: isoDaysAgo(Math.floor(Math.random() * 10)),
      });
    }
  });

  // Apply follow-up dates onto people.attributes (merge, keep sample flag).
  const followEntries = Object.entries(followUpByPerson);
  for (const [personId, date] of followEntries) {
    const person = people.find((p) => p.id === personId);
    const merged = { ...(person?.attributes || {}), next_follow_up: date };
    await rest("PATCH", `people?id=eq.${personId}`, { attributes: merged });
  }
  console.log(`Set next_follow_up on ${followEntries.length} people.`);

  if (activityPayload.length)
    await rest("POST", "activity_log", activityPayload);
  console.log(`Inserted ${activityPayload.length} activity_log rows.`);

  if (ordersPayload.length) await rest("POST", "orders", ordersPayload);
  console.log(`Inserted ${ordersPayload.length} orders.`);

  console.log("\nDone. To remove all of it later: node scripts/seed-sample.mjs --clean");
}

const mode = process.argv.includes("--clean") ? "clean" : "seed";
(mode === "clean" ? clean() : seed()).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
