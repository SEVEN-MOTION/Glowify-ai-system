# Glowify Production Live Milestones

## PROD-LIVE-001 — Production Readiness

- [x] 001.1 Deployment baseline
- [x] 001.2 Deployment protection verification
- [x] 001.3 Authentication and authorization inspection
- [ ] 001.4 Production data and tenant isolation — **partial: Firestore client isolation passes; server API authorization code exists but the current Vite/Vercel deployment does not deploy `apps/web/src/app/api/*` as live serverless functions**
- [x] 001.5 CI/CD and deployment consistency — **Vercel and GitHub Actions aligned to pnpm 10; production build verified**
- [ ] 001.6 Production observability and reliability
- [ ] 001.7 Production UX/data integrity audit
- [ ] 001.8 Final production certification

## Current architectural blocker

The repository contains server-side route handlers under `apps/web/src/app/api/*`, but the live deployment is configured as a Vite static application with `dist` output and a catch-all SPA rewrite. Those route handlers are therefore not currently deployed as Vercel functions. Do not certify server-side API authorization as live until the backend deployment architecture is intentionally implemented and verified.

## Rules

1. Prefer inspection over modification.
2. Only implement changes with a clear production rationale.
3. Do not introduce subscription restrictions before billing is intentionally enabled.
4. Preserve founder/owner access for `glowifybabystores@gmail.com`.
5. Every production-affecting change must be verified in a deployment before certification.
6. Never claim a server-side control is live unless the deployment architecture actually executes it.
