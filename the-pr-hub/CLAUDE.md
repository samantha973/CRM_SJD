# Project Catalog

## Stack (already installed and wired — record the values)
- GitHub repo: samantha973/CRM_SJD (https://github.com/samantha973/CRM_SJD)
- Vercel project: crm-sjd (scope: the-pr-hub) → LIVE prod https://crm-sjd.vercel.app; Root Directory = the-pr-hub; 4 env vars set
- Domain: DECISION — stay on https://crm-sjd.vercel.app (this is the live app URL). theprhub.com.au is a separate existing WordPress site, intentionally left untouched; not attached to Vercel.
  - Note for Build 2: NEXT_PUBLIC_SITE_URL is currently https://theprhub.com.au but the app serves at crm-sjd.vercel.app. Update it to https://crm-sjd.vercel.app before wiring Resend confirmation-email links (else links 404 on the WP site).
- Supabase project: PR-Master (ref nimpqityqghejcllszzi, region ap-southeast-2)
- Supabase URL: https://nimpqityqghejcllszzi.supabase.co
- Supabase service key: set in .env.local + Vercel env (never committed)
- Resend account: [pending] — not needed until Build 2

## Build (filled as we go)
- Plan written: done
- Build 1 (small) status: ✅ DONE & LIVE at https://crm-sjd.vercel.app (merged PR #1, real build, submit→admin loop verified in prod). Domain decision: staying on crm-sjd.vercel.app.
- Admin account seeded: ✅ with email samantha@theprhub.com.au (sign-in verified)
- Build 2 (all) status: 🟢 CORE LIVE (merged PR #2 → prod https://crm-sjd.vercel.app on 2026-08-31);
  email piece deferred. Built behind existing login: full People directory (searchable, shows custom
  attributes) + person record page (identity, inquiries, orders, activity timeline); Inbox = all
  inquiries with a working pipeline (new_lead→contacted→discovery_call→proposal→won/lost) where every
  stage change writes one activity_log row (from_status, to_status, actor=admin email, optional note);
  Orders list + add-order against a person; Newsletter list (ok_to_contact = true) with copy-emails.
  Verified: build/Vercel-preview passes; dedup-by-email; embedded queries; pipeline move writes exactly
  one activity_log row; order stores cents; every /admin route redirects to login when logged out.
  NOT DONE vs plan DoD: (a) Resend/confirmation email — DEFERRED at operator request 2026-08-31
  ("no resend for now"), so Build 2 is NOT fully ✅; (b) operator has not yet run the human
  login+click-through test on prod.
- Resend domain verified: [pending] — deferred by operator on 2026-08-31; not started. When ready:
  verify a sending domain in Resend (recommend send.theprhub.com.au subdomain so root WordPress DNS
  is untouched), set NEXT_PUBLIC_SITE_URL=https://crm-sjd.vercel.app, `npm i resend`, then wire the
  confirmation + notification emails into app/api/contact/route.ts.

# How to use this catalog

You are my engineering partner. Before any task or /goal command:
1. Read this entire CLAUDE.md AND Working Files/product-plan.md.
2. Identify which catalog + plan items the task requires.
3. If any required item is [pending] or empty, STOP and tell me what to
   fill in. Use plain English: "I need X to do this. Please Y."
4. Don't proceed until every required item is filled.
5. After the task succeeds, update the catalog with new state.

Required items by task:
- /goal build 1 (small) → product-plan.md complete
- /goal build 2 (all) → product-plan.md + Build 1 complete + Resend domain verified
- Any deploy → GitHub + Vercel + Domain confirmed
