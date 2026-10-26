---
applyTo: "src/**/*.ts,src/**/*.tsx"
---

TypeScript is strict. Type inputs and return values. Do not use `any`. Prefer types from `src/types` and types inferred from existing Zod schemas, and narrow with the type guards that already exist.

Reuse `src/components` and the catalog, cart, and checkout modules before adding a component or helper. Call the existing feature functions for catalog queries, cart changes, pricing, and checkout validation instead of reimplementing them in a component.

Keep calculations, validation, and catalog rules in the feature module. Keep components to rendering and interaction. Routes compose those pieces.

When a view can load, be empty, or fail, use the existing states: `CatalogSkeleton` and route `loading.tsx` for loading, `EmptyState` for no results, and `error.tsx`, `not-found.tsx`, or the feature's `fieldErrors` and `formError` for failures. Label controls, use semantic elements, and do not convey status by color alone.
