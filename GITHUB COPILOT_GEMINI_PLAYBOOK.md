# GITHUB COPILOT_GEMINI_PLAYBOOK

Purpose
-------
This playbook codifies contribution rules and engineering principles for Copilot/Gemini-assisted development on the Glowify AI System repository. It is authoritative guidance for automated agents and human contributors who make UI and platform changes.

Canonical Frontend
------------------
- The only canonical frontend is: `/src`
- Do NOT modify or add first-class UI surfaces under:
  - `/glowify-ai`
  - `/apps/web`

Architecture Mapping
--------------------
- Contracts → `packages/*` (interface, types, contract-only packages)
- Runtime → `backend/services` (concrete implementations and server-side logic)
- Frontend → `/src` (canonical browser UI and components)

Core Principles (enforced for every change)
------------------------------------------
1. Mobile first — design and verify small viewports before desktop.
2. AI-first UX — surfaces should surface AI insights, actions, and explainability.
3. Revenue-first dashboard — the executive view must prioritize revenue, impact, and next actions.
4. Tenant isolation — every business object and action must be tenant-scoped and audited.
5. Type-safe API — prefer strict TypeScript contracts and typed API payloads.
6. Provider-agnostic AI — AI integrations are adapter-backed and swappable; never call vendor SDKs from the browser.
7. Accessibility first — keyboard, focus, ARIA, contrast, and mobile tap targets must be validated.
8. Never duplicate components — prefer reuse; single source of truth for primitives and tokens.
9. Keep components small — single responsibility, simple props, composition over magic.
10. Explain every modification — every commit/PR description (and any assistant message that applies code) MUST include the change summary template below.

When making a change: mandatory checklist
---------------------------------------
- Confirm the change is inside `/src` before editing UI code.
- If a change touches backend or AI behavior, ensure server-side contracts exist in `packages/*` or `backend/services`.
- Do not add new UI roots or duplicate shells — extend the canonical `/src` shell instead.
- For any AI-driven feature, produce structured outputs (not freeform) for the UI to act upon, and include trace metadata and confidence scores.
- Include a short accessibility checklist in the PR description (keyboard access, focus states, aria-labels, contrast, reduced-motion support).
- Add unit tests for component logic and small integration tests for critical flows.

Explain-every-modification template
-----------------------------------
Every final summary (commit message, PR description, or assistant report) must include these sections (fill them exactly):

Files modified:
Components added:
UX improvements:
Accessibility improvements:
Performance improvements:
Validation summary:

- Files modified: list file paths changed (relative to repo root).
- Components added: list new React/TS components or large UI primitives introduced.
- UX improvements: short bullets describing UX changes and why they help the user (map to revenue or AI-first goals).
- Accessibility improvements: explicit accessible changes made and test results (keyboard, screen reader, contrast checks).
- Performance improvements: any measures taken (code splitting, memoization, reduced reflows, chart virtualization).
- Validation summary: tests run, linter/tsc results, manual smoke checks, and whether the change is behind a feature flag.

Commit & PR guidance
--------------------
- Keep changes focused. One feature or bugfix per PR.
- Use descriptive commit messages and include the "Explain-every-modification" summary in the PR description.
- Include the following Co-authored-by footer in commits created by Copilot/Gemini agents unless explicitly requested not to:

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

- Ensure CI passes (type-checking, lint, unit tests) before merging.

Security & Data
---------------
- Secrets MUST never be committed or returned to clients.
- Webhooks must be verified server-side and deduplicated.
- All writes must be idempotent where practical and must include tenant metadata.

AI & Provider Rules
-------------------
- Never call provider SDKs from browser code. All provider interactions must be server-side.
- AI responses that produce actions must be strongly typed (JSON schema or typed DTO) and include: tenant_id, trace_id, provider, confidence, timestamp, and a non-actionable human-readable explanation.
- UI must render AI actions in a review flow requiring explicit confirmation for destructive or commerce-impacting operations.

Design Tokens & Styling
-----------------------
- Prefer tokens from the canonical theme in `/src/theme`.
- Avoid creating a second design system. If a new token is needed, add it to the canonical theme and document the reason.

Accessibility & Mobile
----------------------
- Default to mobile-first layouts. Validate responsive behavior for all breakpoints in PR QA steps.
- Provide keyboard focus states, visible focus rings, and accessible names for interactive elements.
- Honor prefers-reduced-motion and provide an option to disable heavy animations.

Developer checklist before merging
---------------------------------
1. TypeScript: compile with no errors (tsc).
2. Lint: run repo linter (eslint) and fix new issues.
3. Tests: unit tests for new logic and a small integration smoke test.
4. Accessibility: run axe/devtools checks on modified pages.
5. Manual smoke: login -> open executive view -> trigger an AI action in a safe feature-flag mode.
6. PR description: include the Explain-every-modification template filled out.

Appendix: Quick PR template snippet
----------------------------------
Summary of changes:

Files modified:

Components added:

Why this change:

Testing performed:

Accessibility checks:

Notes and follow-ups:

---

This playbook file is a repository-level artifact. Keep it up to date when product directions shift or when new engineering constraints are required.

Created by: Copilot/Gemini playbook generator
Date: 2026-07-10
