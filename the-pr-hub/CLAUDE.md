# Project Catalog

## Stack (already installed and wired — record the values)
- GitHub repo: samantha973/CRM_SJD (https://github.com/samantha973/CRM_SJD)
- Vercel project: crm-sjd (scope: the-pr-hub) → prod https://crm-sjd.vercel.app; Root Directory must = the-pr-hub
- Domain: theprhub.com.au (aliased on the crm-sjd Vercel project)
- Supabase project: PR-Master (ref nimpqityqghejcllszzi, region ap-southeast-2)
- Supabase URL: https://nimpqityqghejcllszzi.supabase.co
- Supabase service key: set in .env.local + Vercel env (never committed)
- Resend account: [pending] — not needed until Build 2

## Build (filled as we go)
- Plan written: done
- Build 1 (small) status: ✅ (verified locally end-to-end; live on domain pending PR merge → Vercel deploy)
- Admin account seeded: ✅ with email samantha@theprhub.com.au (sign-in verified)
- Build 2 (all) status: [pending]
- Resend domain verified: [pending]

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
