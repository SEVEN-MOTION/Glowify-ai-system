# Phase 1 Supplement — Runtime and Route Reachability Investigation

Repository: `SEVEN-MOTION/Glowify-ai-system`
Reviewed ref: `master` at `cc318d7852b3af7687872d2d59ab2251473d3ed8`
Working branch: `security/glowify-auth-hardening`
Status: Investigation only. Phase 2 has not started.

## Executive conclusion

**The repository configuration points to a root-level Vite SPA deployment on Vercel, not a Next.js deployment.** The repo alone does not expose the Vercel dashboard's selected Root Directory or live deployment metadata, so the actual production configuration cannot be proven from source alone. Do not treat the Next.js-style `src/app/api/**`, `apps/web/src/app/api/**`, or `glowify-ai/src/app/api/**` handlers as production routes until the Vercel project settings/deployment are checked.

## Runtime evidence

1. Root `package.json`: `dev=vite`, `build=vite build`, `preview=vite preview`; no Next.js dependency, no `test` script, and no server-authentication test script.
2. Root `vercel.json`: `framework: vite`, `buildCommand: pnpm build`, `outputDirectory: dist`, and SPA fallback rewrite for paths other than `/api`.
3. Root `vite.config.js`: Vite + React + PWA; no server framework adapter is configured there.
4. Root `api/health.ts` is a Vercel-style serverless function candidate at `/api/health`. The `/api` rewrite exclusion preserves this path. No equivalent evidence shows Next.js App Router route handlers are built by this root configuration.
5. `apps/web/package.json` was not present at the checked path. `glowify-ai/package.json` also defines a Vite app, not Next.js.
6. Root dependencies include the Firebase client SDK and Google GenAI, but do not include `next` or `firebase-admin`. Root API route files that import Next.js and Firebase Admin therefore do not match the root package's declared runtime dependencies.
7. `firebase.json` maps Firestore rules to `firestore.rules`; this describes Firebase CLI configuration, not proof that the current rules were deployed.
8. `.github/workflows/ci.yml` runs install, lint, and build on pushes/PRs to `master`. It does not run `vitest` or the security tests.

### Route reachability matrix

| Code location | Framework/config evidence | Reachability conclusion |
|---|---|---|
| Root Vite SPA (`src/main.tsx`, root package/config) | Directly matches root build and Vercel config | Strongest candidate for the configured frontend. Actual live project root still requires Vercel dashboard confirmation. |
| Root `api/health.ts` | Vercel `/api` function convention and rewrite exclusion | Likely intended as a Vercel function if root directory is repository root; confirm with deployed URL/status. |
| Root `src/app/api/**` | Next.js-style handlers, but root package/config is Vite and lacks Next/Firebase Admin dependencies | Not established as executable API routes under the checked root config. Treat as unproven/unreachable until deployment config says otherwise. |
| `apps/web/**` | Contains Next.js-style handlers and middleware; no `apps/web/package.json` found | No evidence of a separately buildable app from repository files checked. Reachability unproven. |
| `glowify-ai/src/app/api/**` | Next.js-style handlers inside a separate Vite package | Not executable as App Router routes under the checked `glowify-ai` package config. Reachability unproven. |
| `packages/api-gateway/**`, `packages/authentication/**`, `packages/authorization/**` | Package files are contracts/scaffolding; inspected gateway middleware/route files define interfaces | Not evidence of an active HTTP authentication gateway by themselves. Call sites and bootstrap wiring must be verified before relying on them. |

## Duplicate route comparison

### AI analysis

- `src/app/api/ai/analyze/route.ts`: accepts `storeId` and `eventData`; no visible authentication or store-ownership check before calling the model and writing telemetry.
- `glowify-ai/src/app/api/ai/analyze/route.ts`: same unauthenticated shape.
- `apps/web/src/app/api/ai/analyze/route.ts`: calls `requireStoreAccess(req, storeId)` before model execution and telemetry writes.

The implementations differ materially. Do not patch only one copy without establishing which app owns the route.

### Admin observability and queue health

- Root `src/app/api/admin/observability/route.ts` and `glowify-ai/src/app/api/admin/observability/route.ts` return status information without a visible admin check.
- `apps/web/src/app/api/admin/observability/route.ts` calls `requireAdmin`.
- Root and `glowify-ai` queue-health routes have no visible admin check.
- `apps/web/src/app/api/admin/queue-health/route.ts` calls `requireAdmin`.

If any unauthenticated variant is actually served, these should be treated as security-sensitive operational endpoints.

### Shopify webhook

- Root `src/app/api/webhooks/shopify/route.ts` reads the HMAC header but the inspected handler does not validate it before processing the JSON body. It imports the Firebase client SDK.
- Root `src/app/api/webhook/shopify/route.ts` uses an HMAC calculation and Firebase Admin SDK. The same path exists under `glowify-ai` and `apps/web`.
- `apps/web/src/app/api/webhook/shopify/route.ts` computes a base64 HMAC of the raw request body before parsing JSON, then maps shop domain to a store. Its comparison is ordinary string equality, and secret presence/error handling, replay/idempotency, and event-topic validation still need review.
- There is also `apps/web/src/app/api/webhooks/shopify/utils.ts`, used by the existing test. The tests prove a utility rejects a bad signature, not that a production route is reachable or securely wired.

The singular/plural path difference matters: `/api/webhook/shopify` and `/api/webhooks/shopify` are distinct routes.

## Authentication and authorization call-site inventory

- `apps/web/src/app/api/ai/analyze/route.ts` uses `requireStoreAccess`.
- `apps/web/src/app/api/admin/observability/route.ts` uses `requireAdmin`.
- `apps/web/src/app/api/admin/queue-health/route.ts` uses `requireAdmin`.
- `apps/web/middleware.ts` exports a middleware function that verifies a Firebase Bearer token and adds `x-user-uid`; however, it is outside the root Vite app and does not by itself establish trusted identity for any deployed route.
- The same file separately exports `authenticateRequest`, which looks up a raw `x-api-key` in Prisma and includes the tenant. The inspected tests call this helper directly. That is not proof of request-wide middleware enforcement or proof all handlers check its result.
- Root `src/lib/api.ts` uses the Firebase client SDK to query user-scoped Firestore subcollections, passing `userId` into the query helper. The rules are the actual authorization boundary for those direct client reads; UI-supplied IDs alone are not authorization.
- `firestore.rules` currently permits a user to read/write their entire own profile and all descendants. This makes client-side role/plan/integration fields unsafe to trust server-side.
- Root `src/lib/firebase-admin.ts` imports Admin SDK and loads `.env.local`, but the root package does not declare `firebase-admin`; it appears to be a dormant/unbuildable server helper under the declared Vite root unless another deployment context provides dependencies.

## Test and CI reachability

- `apps/web/tests/security.test.ts` imports `../middleware` and checks API-key helper behavior, Safe Mode, and the Shopify signature utility.
- Root CI only runs `pnpm lint` and `pnpm build`; no test command is configured.
- Therefore, the existing security tests are not demonstrated to run in CI, and they do not validate the root Vite deployment's HTTP behavior.
- The existing `RUNTIME_INTEGRITY_REPORT.md` describes manual validation, but refers to `apps/web/src/middleware.ts`, while the inspected middleware file is `apps/web/middleware.ts`. Treat that report as documentation, not proof of deployed runtime behavior.

## What remains unverified outside repository access

The GitHub source cannot reveal the Vercel project's current Root Directory, production domain/deployment, assigned environment variables, or whether a separate Vercel project points at `apps/web` or `glowify-ai`. Confirm in Vercel project settings / deployment details without exposing secret values. If multiple Vercel projects exist, record each project's root directory and production domain.

## Phase 1 recommendation

Before Phase 2, confirm the deployed project's Root Directory and production URL, and test only a non-sensitive health endpoint (such as `/api/health`) through the normal browser/dashboard workflow. Do not deploy or change configuration as part of this confirmation. If root Vite is the deployed app, Phase 2 should prioritize securing the actual Firebase client/Firestore access model and should not assume Next.js API handlers are serving requests. If a separate Next.js project is deployed, scope hardening to that project's entry points and dependencies first.

No application code, Firestore rules, environment values, or deployment configuration were changed during this investigation.
