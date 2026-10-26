---
name: feature-development
description: "Implement a ShopSphere storefront feature with a short plan, tests first where practical, and only checks that were actually run. Use when asked to add or change catalog, cart, checkout, pages, shared UI, or the products API. Do not use for a plan-only request."
argument-hint: "The feature to implement"
---

# Feature development

Implement the requested ShopSphere feature. ShopSphere is a mock storefront: catalog, cart, and checkout behavior live in `src/features`, routes in `src/app` stay thin, shared UI lives in `src/components`, and products come from `src/data/products.ts`. There is no database.

Do not add a dependency or an abstraction unless the existing code cannot express the change. Preserve behavior the request does not change.

## 1. Understand the requirement

Restate the outcome. List ambiguities that would change the implementation. For each one, state the assumption you will use.

Stop and ask before editing if the request needs an architectural decision it does not already make. That includes a database, authentication, payment, an external service, a new feature boundary, or moving logic between server and client in a way the current code does not already do.

## 2. Inspect existing code and tests

Before editing, read the routes, feature modules, shared components, and tests the change would touch. Name the files you read. Match the nearest existing implementation.

Vitest runs `tests/**/*.test.{ts,tsx}` with `tests/setup.tsx`. Playwright runs `e2e/**/*.spec.ts` and starts the dev server. Current coverage includes catalog query, cart, checkout, the products API, storefront components, and the shopper journey in `e2e/storefront.spec.ts`.

## 3. Plan and acceptance criteria

Write a short plan: the files to change, why each one changes, and the observable acceptance criteria. Include success, failure, and boundary cases. Do not start editing until this plan is stated.

## 4. Apply instructions and conventions

Read `.github/copilot-instructions.md`. Read `.github/instructions/application.instructions.md` when changing `src/**/*.ts` or `src/**/*.tsx`. Read `.github/instructions/tests.instructions.md` when changing `tests/**` or `e2e/**`. Follow those files instead of inventing a new pattern.

## 5. Tests before implementation

Where practical, add or update the failing test before the implementation. Use Vitest for feature behavior and React Testing Library for components. Use Playwright only when the shopper-facing flow changes. Assert return values, status codes, visible text, or accessible roles.

If a test cannot come first, say why, then add or update it before finishing if behavior changed.

## 6. Implement the smallest change

Change only the files in the plan. Keep calculations, validation, and catalog rules in the feature module. Keep components to rendering and interaction. Reuse existing components and helpers. Do not refactor unrelated code.

## 7. Run checks

Run the checks that match the change:

- `npm run test` for unit and component behavior.
- `npm run test:e2e` when a shopper-facing flow changes.
- `npm run lint` and `npm run typecheck` when TypeScript or UI code changes.
- `npm run format:check` when files were edited.

A check you did not run is not a pass. Record the command, the exit status, and the relevant failure output.

## 8. Review the diff

Read the full diff. Confirm it stays inside the plan, preserves unrelated behavior, adds no unused dependency or abstraction, and covers the behavior that changed. Fix gaps before reporting completion.

## 9. Report

Report:

- Files changed and why.
- Commands run, and the result you observed for each. Say "not run" for anything you skipped.
- Acceptance criteria that are met, and any that are not.
- Unresolved risks or questions.
