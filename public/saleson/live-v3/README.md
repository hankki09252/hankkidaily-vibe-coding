# SalesON Live v3

Deployment: https://saleson-live-v3-nsqapa5q8-hankki09250425.vercel.app

## Current working features
- Premium mobile-first SalesON UI
- Local persistent customer storage (browser localStorage)
- Customer create/edit
- Duplicate phone check on create
- Call and SMS deep links
- Follow-up queue
- Today / focus / 60+ day metrics
- Relationship health score
- Customer timeline and consultation notes
- Next-contact date management
- Personal greeting-message template
- Business-card camera capture with preview, followed by confirmation form
- JSON backup export

## Data isolation guardrail
- Do not connect to, read from, migrate, modify, or write to the AMAON Supabase project.
- SalesON remains local-only until a separate SalesON backend is created.
- Any future Supabase integration must use a separate SalesON organization/project and per-user RLS.

## Next backend work
1. Create a separate SalesON Free Supabase organization/project.
2. Add Auth, customers, interactions, reminders and RLS.
3. Add server-side CLOVA name-card OCR; never expose OCR secret in browser code.
4. Migrate local data only after user confirmation.
