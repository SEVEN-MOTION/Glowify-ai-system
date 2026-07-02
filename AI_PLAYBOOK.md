# Glowify AI Playbook

This document is the supreme engineering authority for the repository.

If any existing code conflicts with this playbook, treat the code as debt. Do not create a third pattern. Do not introduce parallel architecture. Do not add a new UI surface unless it is explicitly assigned here.

## 1. Vision of Glowify AI

Glowify AI is an AI-first Business Operating System for Shopify merchants and SMEs.

It is not a dashboard clone. It is an operating surface for revenue, inventory, marketing, customer intelligence, automation, and executive decision-making.

The product should feel:
- Calm under pressure.
- Fast to understand.
- Precise in its visual language.
- Confident in its interactions.
- Intelligent without feeling noisy or over-automated.

The target quality bar is the polish of Stripe, Linear, Arc, Vercel, Apple, and OpenAI products.

## 2. Mission

The mission is to help merchants run the business, not just observe it.

Glowify AI should:
- Turn business data into decisions.
- Turn decisions into actions.
- Turn actions into measurable outcomes.
- Reduce operational friction across commerce, support, marketing, and automation.
- Make AI feel useful, explainable, and trustworthy.

## 3. Product Philosophy

- The product is outcome-driven, not feature-driven.
- Every screen must answer: "What decision does this help the user make?"
- Every AI action must be traceable to a business context.
- The interface must prioritize clarity, speed, and confidence over decoration.
- The product should feel premium, but never ornamental.
- The system should be opinionated about workflows, but not rigid about user intent.
- Mock data is acceptable for local development and prototypes, but production UX must never rely on fake behavior to feel complete.

## 4. Engineering Principles

- Canonical first: prefer one authoritative implementation per concern.
- Contract first: define interfaces before runtime details.
- Tenant first: every business object, request, and automation must be tenant-scoped.
- Observable by default: actions should be traceable, debuggable, and measurable.
- Swappable providers: vendor integrations must sit behind stable abstractions.
- Minimal surface area: do not widen APIs or state shape without a clear need.
- No architecture drift: do not copy a pattern into a second place when the first place already exists.
- Deterministic UI: avoid random rendering, unstable keys, or render-time data generation unless explicitly intended.
- Progressive delivery: keep changes small, reviewable, and reversible.

## 5. UI Philosophy

The UI should feel like an AI-native operations console, not a generic admin dashboard.

UI rules:
- Use a dark premium base with subtle contrast, not flat gray enterprise chrome.
- Use depth, glow, and noise sparingly to create atmosphere.
- Make high-value surfaces feel editorial and intentional.
- Keep hierarchy strong: one clear primary action, one clear main reading path, one clear supporting layer.
- Avoid visual clutter. Dense does not mean busy.
- Use cards, panels, tabs, drawers, and overlays only when they clarify task flow.
- Preserve the current design language instead of mixing in unrelated aesthetics.

## 6. UX Philosophy

- Users must always know where they are, what changed, and what to do next.
- High-frequency workflows should be one or two steps, not deep navigation mazes.
- AI outputs must be legible, editable, and explainable.
- Error states must be actionable.
- Loading states must feel intentional, not like blank waiting.
- Empty states must teach the next action.
- Sensitive actions must always require clear confirmation.
- Never hide important system status behind ambiguous icons or hover-only affordances.

## 7. Backend Philosophy

- The frontend owns presentation and interaction only.
- Business logic belongs in backend services and domain packages.
- External providers must never be called directly from the browser when a server boundary is available.
- Secrets must remain server-side.
- Webhooks must be verified, normalized, and deduplicated.
- All writes must be idempotent where practical.
- Every backend action must carry tenant context.
- Prefer typed service contracts over ad hoc utility calls.

## 8. AI Philosophy

AI is a decision-support layer, not a magical black box.

AI rules:
- AI outputs must be grounded in tenant data or explicitly labeled as suggestions.
- AI responses should be structured when the UI needs to render actions, not just prose.
- AI behavior must be explainable through source signals, confidence, or trace metadata.
- AI should assist execution, not replace user control.
- AI must not invent business facts, metrics, or outcomes.
- AI should favor short, precise, operational language.
- Every AI feature must define failure behavior, fallback behavior, and safe partial results.
- Model/provider choice must remain swappable behind a stable interface.

## 9. Architecture Rules

1. `/src` is the canonical frontend.
2. `glowify-ai/` and `apps/web/` are migration or legacy surfaces unless a task explicitly says otherwise.
3. No new first-class UI should be created outside `/src`.
4. Do not duplicate a view, layout, or shell across frontend roots.
5. Do not introduce a second design system.
6. Do not introduce a second command palette, notification system, auth flow, or dashboard shell.
7. Shared contracts stay in `packages/*`; UI stays in the canonical frontend.
8. Browser code must not depend on backend-only implementation details.
9. Backend code must not import browser-only UI or state.
10. If a change would create architectural ambiguity, stop and resolve the boundary first.

## 10. Coding Rules

- TypeScript first for new code.
- Prefer explicit types on public component and service boundaries.
- Avoid `any` unless it is a temporary compatibility shim around an external boundary, and keep that exception local.
- Keep files small and single-purpose.
- Prefer composition over inheritance.
- Avoid broad refactors when a targeted fix will do.
- Do not introduce new abstractions unless they remove duplication or clarify ownership.
- Do not use broad regex replacements for cleanup.
- Do not add new patterns just because existing code contains older patterns.
- Keep component props and service contracts minimal and stable.

## 11. Folder Ownership

- `src/`: canonical product frontend.
- `src/components/`: reusable canonical UI and feature components.
- `src/components/views/`: full-screen business views and task surfaces.
- `src/components/ai/`: AI-specific UI pieces used by the canonical frontend.
- `src/contexts/`: React providers and application state boundaries.
- `src/lib/`: browser-safe client helpers and adapters.
- `src/services/`: client-side service facades.
- `src/app/`: route handlers and app-route entrypoints.
- `packages/*`: shared contracts, backend services, and platform logic.
- `glowify-ai/`: legacy or migration frontend surface.
- `apps/web/`: legacy or transitional frontend surface with mixed runtime assumptions.
- `docs/`: architectural and process documentation.

## 12. Component Ownership

- Design primitives belong in one shared canonical layer, not duplicated per feature page.
- Shell components own application chrome, navigation, workspace context, and global overlays.
- View components own business workflows and dashboard pages.
- Widget components own one focused business capability, such as a metric card, AI panel, or table block.
- AI components own prompting surfaces, explanation surfaces, and action suggestions.
- Auth components own login, signup, reset, onboarding, and account recovery.
- Settings components own preferences, billing, integrations, and security.
- If a component is reused in more than one place, it must remain visually and behaviorally identical.

## 13. Design Language

The design language is a dark premium operations system with warm rose/garnet accents.

Approved visual tokens and directions:
- Base backgrounds: `#080608`, `#100D10`, `#0F0F1E`, `#0D0D1A`.
- Border language: `#231820`, `#1E1E3A`, soft glowing edges, subtle separators.
- Primary accent: `#C9747A`.
- Secondary accent: `#8B4A6B`.
- Text hierarchy: bright off-white for primary, muted lavender-gray for secondary, low-contrast gray for tertiary.
- Surface treatment: glassy cards, subtle blur, light noise texture, restrained radial glows.
- Typography: `Plus Jakarta Sans` for UI and `JetBrains Mono` for diagnostics, IDs, logs, and technical surfaces.
- Iconography: use the existing `lucide-react` style and keep icon weights visually consistent.

Design do:
- Keep panels spacious and readable.
- Use premium contrast without harsh white glare.
- Make system state visible through color, spacing, and hierarchy.
- Let semantic colors communicate status, not decoration.

Design do not:
- Do not introduce random purple-heavy themes.
- Do not mix unrelated visual systems in one flow.
- Do not add loud gradients, heavy shadows, or noisy backgrounds without purpose.
- Do not make every surface glow.

## 14. Animation Rules

- Motion must serve clarity, not spectacle.
- Animate only when it helps users understand state change, hierarchy, or completion.
- Prefer opacity and transform animations.
- Keep transitions short and predictable.
- Use stagger and easing sparingly for entry states and overlays.
- Avoid perpetual motion unless it communicates live status.
- Do not animate large data surfaces in a way that harms readability.
- Do not stack too many concurrent animations in one view.

## 15. Accessibility Rules

- All interactive controls must be keyboard reachable.
- All dialogs, drawers, palettes, and menus must support escape-to-close behavior.
- Focus state must be visible and intentional.
- Color contrast must remain readable on dark surfaces.
- Icon-only controls need accessible names.
- Form errors must be announced or otherwise exposed to assistive tech.
- Tap targets must be large enough for mobile use.
- Do not rely on hover alone to reveal critical information.
- Do not trap focus or hide navigation without an escape path.

## 16. Performance Rules

- Keep render paths deterministic.
- Avoid generating random UI data during render.
- Avoid unnecessary re-renders in heavy chart, list, or animation views.
- Do not mount expensive motion or chart libraries on every screen if they are not needed.
- Prefer stable keys, stable props, and stable data references.
- Use code splitting or deferred loading for heavy surfaces when necessary.
- Keep dashboard tables and charts responsive and bounded in size.
- Do not let decorative effects block interaction or scroll performance.

## 17. Mobile First Rules

- Design for small screens first, then expand upward.
- Navigation must collapse cleanly on mobile.
- Sidebars should become drawers or bottom navigation when space is constrained.
- Tables must either stack, scroll horizontally, or transform into card layouts.
- Command surfaces and drawers must fit mobile viewport constraints.
- Primary actions must remain reachable without precision tapping.
- No screen should require horizontal page scrolling.
- Avoid dense multi-column layouts until the viewport can support them.

## 18. AI Assistant Behavior

Any future AI agent working in this repository must follow these rules:
- Read this playbook before touching code.
- Inspect the repo first; do not assume the architecture.
- Summarize what you found before editing.
- Make the smallest change that solves the task.
- Preserve existing user changes and do not revert unrelated edits.
- Do not introduce new architectural patterns without explicit instruction.
- Do not create duplicate UI surfaces.
- Do not use broad regex replacements or sweeping mechanical edits.
- Stop and ask when a decision depends on product direction, ownership, or boundary definition.
- Validate changes with the smallest relevant check, then stop once the repo is stable for the requested scope.

## 19. Error Handling Standards

- Use typed errors or typed failure objects where possible.
- Do not swallow errors silently.
- Do not leak provider stack traces or raw server payloads into the UI.
- User-facing errors must be concise and actionable.
- Retryable failures and fatal failures must be distinguished.
- Forms should show inline validation near the relevant field.
- Global failures should show a visible recovery path.
- Empty states are not errors; they should guide the next step.
- Loading, empty, error, and success states are all required for meaningful user flows.

## 20. API Standards

- API contracts must be stable, versioned, and tenant-aware.
- Mutations should be idempotent when the operation may be retried.
- Webhooks must be verified server-side before processing.
- Do not expose secrets, internal identifiers, or raw provider internals in client responses.
- Prefer consistent response envelopes for success and failure payloads.
- Validation happens at the boundary, not deep in the UI.
- Authorization checks must happen server-side.
- API design should favor explicit inputs and explicit outputs over implicit magic.

## 21. Documentation Standards

- Document the canonical source of truth when a new surface, package, or contract is introduced.
- Keep public architecture docs aligned with actual repository structure.
- Update this playbook when a rule changes.
- Document why a boundary exists, not just that it exists.
- Keep comments brief and purposeful; do not narrate obvious code.
- Mark legacy or transitional surfaces clearly in docs.
- When a feature depends on a specific data assumption, state that assumption in the relevant documentation.

## 22. Naming Conventions

- React components: `PascalCase`.
- Hooks: `useCamelCase`.
- Context providers: `XProvider`.
- Context hooks: `useX`.
- Files that export one component should usually match the component name.
- Boolean flags should read like assertions, such as `isOpen`, `hasAccess`, `canEdit`, or `loading`.
- Event handlers should read like actions, such as `handleSubmit`, `handleClose`, or `handleNavigate`.
- Feature route names should be short, stable, and meaningful.
- Avoid vague names like `stuff`, `temp`, `new`, or `final2`.

## 23. Git Conventions

- Use feature branches for all work.
- Commit messages should follow conventional style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Keep commits scoped to one logical change.
- Do not mix architecture changes with UI polish in the same commit unless explicitly requested.
- Do not commit broken TypeScript or broken syntax.
- Do not force-push shared branches unless explicitly required.
- Use tags only for intentional releases or milestones.
- Document the purpose of large frontend changes in the commit or PR description.

## 24. Final Authority Rule

If a requested change conflicts with this playbook, the request must be clarified before implementation.

If a change would create duplicate UI, duplicate ownership, duplicate contract shapes, or ambiguous architecture, it is not allowed.

If the repository needs a new direction, update this playbook first, then align the code to it.
