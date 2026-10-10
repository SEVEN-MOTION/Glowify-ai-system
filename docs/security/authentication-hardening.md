# Glowify Authentication Security Hardening

Status: Phase 1 inventory completed; implementation is gated on review of each phase.
Branch: `security/glowify-auth-hardening`
Baseline: `master` at `cc318d7852b3af7687872d2d59ab2251473d3ed8`

## Guardrails

- This branch is a proposal only. Do not merge or deploy without explicit approval.
- Do not publish Firestore rules, run shell/SQL, perform destructive migrations, or change deployment settings without explicit approval.
- Never commit live credentials, tokens, service-account JSON, or provider secrets.
- Review each phase's diff and tests before starting the next phase.
- Route reachability must be established from the actual deployment configuration before changing an endpoint. Similar files in different app roots are not interchangeable.

## Phase 1 — Security inventory

### Deployment and source-of-truth findings

- Root `package.json` defines the app scripts as Vite (`dev: vite`, `build: vite build`) and has no Next.js dependency or test script.
- Root `vercel.json` declares `framework: vite`, builds to `dist`, and rewrites non-`/api` paths to `/index.html`.
- The repository contains Next.js-style files under `src/app/api/**` and `apps/web/**`, but `apps/web/package.json` was not found at the baseline path. The deployment route for those files is therefore **not proven** by the inspected config.
- Multiple implementations exist for sensitive operations, including AI analysis and Shopify webhooks. Do not assume the `apps/web` implementation is the production one.
- The security test file imports `apps/web/middleware` and exercises API-key lookup, Safe Mode, and one webhook-signature utility. It does not establish that the root Vite deployment executes these handlers.

### Authentication and authorization inventory

| Area | Current observation | Risk / action |
|---|---|---|
| Firebase client auth | Firebase client SDK is used for sign-in and client auth state. Client persistence is configured as browser-local. | Expected for browser identity; never treat client state as server authorization. |
| Server Firebase ID tokens | `apps/web/src/lib/server-auth.ts` verifies Bearer ID tokens with `verifyIdToken(token)`. | Add explicit revocation checking for sensitive endpoints where operationally appropriate; test expired, malformed, and revoked tokens. |
| Admin authorization | `requireAdmin` allows a hard-coded founder email, otherwise trusts `users/{uid}.role` values `owner` or `admin`. | Move privileged access to a server-controlled claim or authoritative admin registry; do not let self-service profile writes grant roles. |
| Store authorization | `requireStoreAccess` compares the store's owner field with token UID, with a founder-email bypass. | Keep access checks at each store-scoped handler and test cross-tenant denial. Review founder access as an explicit break-glass policy. |
| Request identity headers | Middleware verifies a token then injects `x-user-uid`. | Downstream handlers must not trust caller-supplied identity headers; derive identity from verified credentials or overwrite headers at a trusted boundary. |
| Firestore rules | `firestore.rules` permits an authenticated user to read/write their entire own user document and recursively all subcollections. | Self-write can include role, plan, or integration-secret fields. Replace broad writes with field/collection-specific rules and server-owned authorization fields. Do not publish rules without approval. |
| Settings save endpoint | `src/app/api/settings/save/route.ts` accepts a body `uid`, has no visible caller-token verification, uses the Firebase client SDK on the server, and reports success even if the write fails. | Critical if reachable: authenticate the caller, derive UID from verified token, store secrets server-side, and fail closed on storage errors. Remove hard-coded fallback config. |
| Settings test endpoint | `src/app/api/settings/test/route.ts` accepts a caller-supplied UID and uses mock prefix checks instead of provider verification. | Critical if reachable: authenticate and authorize; label any mock behavior clearly or replace it with bounded real verification. Never claim a real connection based only on key format. |
| Root AI analysis endpoint | `src/app/api/ai/analyze/route.ts` accepts arbitrary `storeId` and writes telemetry without a visible auth/store-access check. | Critical if reachable: authenticate and authorize store ownership before AI calls or writes. |
| Root Shopify webhook | `src/app/api/webhooks/shopify/route.ts` reads the HMAC header but does not visibly validate it before processing; it parses JSON directly and uses client Firestore SDK. | Critical if reachable: verify HMAC over the raw body before parsing, resolve shop-to-tenant from trusted registration, and use server SDK. |
| Alternate web handlers | `apps/web` contains different auth/webhook implementations, including a Shopify verification utility and server-auth helpers. | Reconcile duplicate implementations only after confirming the actual entry point. |
| API keys | `apps/web/middleware.ts` queries Prisma by raw `x-api-key` and includes tenant data. This helper alone does not visibly check expiry, revocation, or a hashed-key design. | Inspect schema and all callers; add lifecycle, scope, rate-limit, and hashed-at-rest controls as applicable. Keep API keys distinct from Firebase ID tokens. |
| Client-exposed configuration | `.env.example` includes `VITE_GEMINI_API_KEY` and integration key names. Vite-prefixed variables are bundled into browser code. | Treat any such value as public. Provider secrets must not be Vite variables or sent back in profile documents. |
| Admin SDK configuration | `apps/web/middleware.ts` reads `FIREBASE_SERVICE_ACCOUNT_KEY`; another server helper uses separate `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` variables. | Standardize server-only credential configuration after runtime is confirmed; fail closed when missing and never use client SDK as Admin SDK. |
| Default profile entitlements | Root Firebase client profile creation sets plan/status defaults to Enterprise/Active. | Entitlements must be server-controlled; new account defaults should be least-privilege and validated against billing/plan policy. |

### Data and secret inventory

- Firebase Auth: identity provider for browser users.
- Firestore: user profiles, nested user data, stores, and telemetry in inspected code.
- PostgreSQL/Prisma: tenant/user data and API-key records in the database package.
- Third-party integration credentials appear in the user-profile type and settings endpoint: Shopify, Klaviyo, and Gemini. This is not an acceptable secret-storage boundary for server-used credentials.
- No production secrets were accessed or changed during this inventory.

### Existing security test coverage

The inspected `apps/web/tests/security.test.ts` covers:
- missing API key is rejected;
- a mocked valid API key returns a tenant;
- Safe Mode blocks an execute path;
- invalid Shopify webhook signature is rejected by a utility.

Coverage gaps:
- Firebase token missing/malformed/expired/revoked;
- admin role assignment and privilege escalation;
- cross-store/cross-tenant access;
- spoofed `x-user-uid` headers;
- unauthenticated settings save/test and UID spoofing;
- failure behavior when persistence fails;
- raw-body webhook HMAC verification and replay/idempotency;
- API-key expiry/revocation/scope/rate limits;
- secret redaction and safe error responses;
- confirmation that tests exercise the deployed entry point.

### Phase exit criteria

Before implementation changes begin, confirm:
1. Which project/root and routes Vercel actually deploys.
2. Which Firebase project and server credential convention are used in the target environment (without exposing values).
3. Whether `src/app/api/**` handlers are deployed at all, and whether any duplicate `apps/web` or `glowify-ai` handler is live.
4. API-key schema fields and every call site of `authenticateRequest`.
5. Existing role/plan semantics and integration-secret consumers so hardening does not silently break legitimate flows.

## Remaining phases (not started)

1. **Authentication boundary:** centralize server token verification, remove trust in spoofable identity headers, make admin and store checks explicit, and add revocation-aware verification where needed.
2. **Data and credential security:** narrow Firestore permissions, secure settings endpoints, make roles/entitlements server-owned, and move integration secrets behind a server-only secret boundary.
3. **Authentication consistency:** align token parsing and admin credentials across the confirmed runtime; separate Firebase ID-token auth from API-key auth; remove insecure fallback configuration.
4. **Security tests:** add positive and negative tests for token validation, roles, tenant boundaries, settings, API keys, webhook verification, and secret handling.
5. **Validation and release readiness:** inspect diffs and available test/build commands, record what was and was not run, and prepare staged rollout/rollback notes. No deployment or rules publication is included.
