---
applyTo: "tests/**/*.ts,tests/**/*.tsx,e2e/**/*.ts"
---

Assert observable behavior: return values, status codes, visible text, and accessible roles. Do not assert private helpers, hook state, or markup that the behavior does not require.

Cover the success path, the failure path, and the boundary next to it, including empty input, invalid values, and stock or quantity limits. When fixing a bug, add a regression test that fails before the fix.

Unit tests use Vitest (`describe`, `it`, `expect`) and call the feature function with a small local fixture. Component tests use React Testing Library and `@testing-library/user-event`, query with role and label, and render through `CartProvider` when the UI needs a cart. End-to-end tests use Playwright in `e2e/` with role and label locators. Use the Next.js mocks in `tests/setup.tsx` instead of adding new ones.
