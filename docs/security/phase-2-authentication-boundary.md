# Phase 2 — Authentication Boundary

Repository: `SEVEN-MOTION/Glowify-ai-system`
Branch: `security/glowify-auth-hardening-phase-2`
Base: current `main` at phase-branch creation
Status: implementation proposal; review required; not deployed

## Scope

This phase hardens the root Vercel-style API handler `api/ai/analyze.ts`, which matches the repository's root Vite/Vercel configuration. Similar Next.js-style handlers under `src/app/api/**`, `apps/web/**`, and `glowify-ai/**` remain outside this patch because their production reachability has not been established.

Phase 1 investigation documents remain on the original inventory branch:
- [Authentication hardening inventory](https://github.com/SEVEN-MOTION/Glowify-ai-system/blob/security/glowify-auth-hardening/docs/security/authentication-hardening.md)
- [Runtime and route investigation](https://github.com/SEVEN-MOTION/Glowify-ai-system/blob/security/glowify-auth-hardening/docs/security/runtime-route-investigation.md)

## Changes proposed in this branch

1. **Revocation-aware Firebase verification:** the AI endpoint calls `verifyIdToken(token, true)`, so revoked tokens are rejected as well as invalid/expired tokens.
2. **No email-based privilege bypass:** removed the hard-coded founder-email exception. Normal users must own the requested store.
3. **Explicit server-controlled admin path:** cross-store access requires the verified Firebase token to contain the custom claim `admin: true`. Firebase custom claims must only be granted by trusted administrative code. This branch does not provision claims or change user roles.
4. **Fail-closed store authorization:** if Firestore cannot establish store ownership, the handler returns `503` and does not call Gemini. Missing stores return `404`; verified non-owners return `403`.
5. **Focused tests:** added handler tests for missing tokens, rejected tokens, owner access, cross-store denial, explicit admin claims, and authorization-service failures.
6. **Test command:** added `pnpm test:security` targeting only `api/ai/analyze.test.ts`, avoiding unrelated legacy test trees whose runtime dependencies are not yet verified.

## Operational compatibility note

Any founder account that previously relied on the hard-coded email exception will need an explicit, server-provisioned `admin: true` custom claim to retain cross-store AI analysis. Until that claim is provisioned through a trusted process, that account is limited to stores it owns. Do not restore an email-based bypass to avoid this migration requirement.

Revocation checking can add an Auth service lookup/latency. Confirm this trade-off in a controlled environment before release.

## Validation status

- Source and test files were committed to this branch through GitHub.
- Automated tests, lint, and production build have **not** been run in this session. No shell command or workflow was executed.
- No deployment, environment variable, Firebase custom claim, Firestore rule, or production setting was changed.
- Phase 2 should not be marked complete until the diff is reviewed and the root test/lint/build checks have been run in a controlled environment.
- Phase 3 and later phases have not started.
