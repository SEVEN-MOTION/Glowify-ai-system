# Glowify AI Master Playbook

This document is the single source of truth for all AI contributors working in this repository.
If any instruction elsewhere conflicts with this playbook, this playbook wins unless a human explicitly overrides it.

## 1. Vision

Glowify AI is **not** a Shopify dashboard.

Glowify AI is an **AI Business Operating System** whose mission is:

> Increase Shopify merchants' revenue through autonomous intelligence.

Every implementation decision must move merchants closer to:

- Increased revenue
- Higher profit
- Better automation
- Faster execution
- Clearer business growth

If a feature does not materially help the merchant grow the business, it should be questioned, simplified, or removed.

## 2. North Star

Every screen must answer at least one of these questions:

| Question | Purpose |
| --- | --- |
| What is happening? | Surface the current state of the business. |
| Why is it happening? | Explain the drivers behind the state. |
| What should the merchant do next? | Turn insight into action. |
| How much money is involved? | Quantify impact in revenue, profit, or cost. |
| Can AI solve this automatically? | Identify opportunities for autonomous execution. |

If a screen cannot answer these questions, it is incomplete.

## 3. Canonical Frontend

The **only canonical frontend** is:

`/src`

Do **not** redesign these legacy surfaces unless explicitly instructed:

- `/glowify-ai`
- `/apps/web`

Those directories are legacy or forked implementations until future consolidation.

## 4. Architecture

Glowify is a modular system built around a clear separation of concerns.

| Layer | Responsibility | Notes |
| --- | --- | --- |
| Frontend | Merchant experience, executive workflow, dashboards, command center | Canonical UI lives in `/src`. |
| Backend | APIs, server logic, persistence, integrations, security boundaries | Keep isolated from presentation. |
| AI | Recommendations, automation, analysis, prioritization, content generation | AI should be proactive, not passive. |
| Packages | Shared domain logic, adapters, runtime tools, capabilities | Respect package boundaries and reuse primitives. |
| Infrastructure | Deployment, hosting, auth, observability, build pipelines | Keep stable and predictable. |
| Data | Metrics, orders, customers, products, events, business signals | All business views should be data-informed. |
| Integrations | Shopify, marketing tools, analytics tools, commerce systems, messaging | Treat as first-class operational surfaces. |

### How the layers interact

1. Data and integrations feed the backend.
2. Backend normalizes and secures business data.
3. AI analyzes signals, detects opportunities, and proposes actions.
4. Frontend converts outputs into executive-grade workflows.
5. Packages provide reusable system capabilities without leaking boundaries.

## 5. Design Principles

Glowify should feel like:

- Linear
- Stripe
- Vercel
- Raycast
- Shopify Admin
- Notion AI

The UI must avoid:

- Clutter
- Dashboard fatigue
- Excessive charts
- Unnecessary colors
- Decorative noise
- Duplicate information

The product should feel:

- Premium
- Minimal
- Executive
- Fast
- AI-first

## 6. Design Language

### Typography

- Use premium, highly legible typography.
- Establish strong hierarchy with clear size, weight, and spacing differences.
- Avoid overly dense or decorative text treatments.

### Spacing

- Use a consistent spacing scale.
- Prefer calm, breathable layouts with strong grouping.
- Avoid accidental crowding and unnecessary whitespace extremes.

### Color Philosophy

- Dark mode first.
- Use color to signal meaning, not decoration.
- Keep the palette restrained.
- Reserve accent colors for business-critical signals, actions, and states.

### Motion

- Motion should support comprehension, not distract.
- Prefer subtle transitions and purposeful reveals.
- Respect reduced-motion preferences.

### Elevation

- Use elevation sparingly.
- Prioritize soft shadows, subtle borders, and layered surfaces.
- Avoid heavy chrome and overly glossy effects.

### Accessibility

- Every interactive element must be keyboard accessible.
- Focus states must be visible.
- Use ARIA labels where appropriate.
- Preserve semantic structure.

### Responsive Behavior

- Design mobile-first.
- Ensure executive content remains readable on smaller screens.
- Reorder content by importance, not by screen width alone.

## 7. Dashboard Philosophy

The first screen should **never** be analytics-first.

The dashboard should begin with:

1. Executive Briefing
2. Today’s Revenue
3. Critical Alerts
4. AI Recommendations
5. Growth Opportunities
6. Tasks

Only after that should users move into detailed analytics.

The dashboard is a decision workspace, not a reporting wall.

## 8. AI Philosophy

Glowify is proactive.

It does not wait for prompts.

It continuously:

- Researches
- Analyzes
- Detects problems
- Suggests improvements
- Creates campaigns
- Finds opportunities
- Prioritizes work

The command bar is only an additional interface.
AI should already be working in the background.

## 9. Coding Standards

All contributors must follow these rules:

- Never duplicate components.
- Prefer reusable primitives.
- Keep components small and focused.
- Prefer composition over monolithic UI blocks.
- Keep business logic outside presentation components where practical.
- Keep backend isolated from frontend concerns.
- Never break package boundaries.
- Always preserve accessibility.
- Avoid unrelated refactors.
- Validate changes before stopping.

## 10. Implementation Phases

The official roadmap is:

| Phase | Name |
| --- | --- |
| Phase 1 | Executive Shell |
| Phase 2 | Executive Mission Control |
| Phase 3 | AI Command Center |
| Phase 4 | Growth Center |
| Phase 5 | Commerce |
| Phase 6 | Marketing |
| Phase 7 | Operations |
| Phase 8 | Finance |
| Phase 9 | Market Intelligence |
| Phase 10 | Automation |
| Phase 11 | Polish & Performance |

Implementation rules:

- Implement only the requested phase.
- Do not begin future phases.
- Do not add scope beyond the requested milestone.
- Do not refactor unrelated systems while shipping a phase.

## 11. AI Contributor Contract

Every AI agent working on this repository must:

1. Read this playbook first.
2. Understand the architecture before coding.
3. Never redesign randomly.
4. Never introduce duplicate UI.
5. Validate before stopping.
6. Summarize the work clearly.

Every final summary must include:

- Files modified
- Components added
- UX improvements
- Accessibility improvements
- Performance improvements
- Validation summary

## 12. Operating Rule

Treat this document as the constitution of the Glowify AI repository.
Build for merchant outcomes. Build for clarity. Build for execution.
