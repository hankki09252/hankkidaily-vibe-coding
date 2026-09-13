# Agent guidance

Keep instructions lightweight and task-specific. Read only the files needed for the requested change; do not inventory the whole repository by default.

## Work to completion
- Implement the requested change, inspect the result, and fix problems introduced by the change without stopping for routine approval.
- Prefer small, coherent edits over unrelated refactors.
- Preserve existing product behavior unless the task asks to change it.

## Repository boundaries
- The root app is **오늘의 9회**, a React/vinext training journal. Use the root `README.md` for product context.
- `bumichal-app/` is a separate 부미챌 application. Touch it only when the task is about 부미챌; its local `README.md` is the relevant product guide.
- For database/schema work, inspect `db/`, `drizzle/`, and `drizzle.config.ts` only as needed.

## Local checks
- Node.js: `>=22.13.0`; package manager: npm.
- Use the narrowest useful check. Run `npm run lint` for code-quality-sensitive changes and `npm test` when behavior/build output is affected.
- Documentation-only or obviously isolated edits do not need a full build.
- Local tests/builds use repository code and may be rerun to fix failures caused by the requested change without asking each time.

## External actions
Do not deploy, change production data, rotate credentials, or perform other external side effects unless the user explicitly asks for that action.
