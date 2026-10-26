# ShopSphere

ShopSphere is a mock retail storefront for brownfield work. It sells electronics, clothing, home goods, and accessories from a local catalog. Checkout validates the order and shows a confirmation. It does not take payment or create a fulfillment record.

## Architecture

- `src/app` — routes, layouts, loading and error UI, and `GET /api/products`.
- `src/components` — shared storefront UI.
- `src/features/catalog` — catalog reads, search, filtering, sorting, and pagination.
- `src/features/cart` — cart changes, stock limits, and price calculation.
- `src/features/checkout` — validation and simulated order placement.
- `src/data/products.ts` — the product seed. There is no database.
- `src/lib` — small shared helpers. `src/types` — shared types.
- `tests` — Vitest unit and component tests. `e2e` — Playwright tests.

Keep route files thin. Put catalog, cart, and checkout behavior in the matching feature module, and shared presentation in `src/components`. The products page and `GET /api/products` must both use `parseCatalogQuery` and `queryCatalog`.

The cart stores only `{ productId, quantity }` in `localStorage` under `shopsphere.cart.v1`. The last confirmation is kept in `sessionStorage`. Prices are integer cents. `quoteCart` and `placeOrder` read price and stock from the catalog and ignore any price sent by the browser. `placeOrder` is a plain function. `placeOrderAction` is the Server Action that reads the form and calls it.

## Next.js, React, and TypeScript

This app uses Next.js 16 with Cache Components (`cacheComponents: true` in `next.config.ts`). Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/` and follow its deprecation notices.

- Server Components are the default. Add `"use client"` only for the cart, header, quantity controls, catalog sorting, checkout form, product image, and route error UI.
- Import application code with the `@/` alias (`src/*`). TypeScript is strict.
- Route modules default-export the page and use the generated `PageProps` and `LayoutProps` types. Other modules use named exports. File names are kebab-case.
- Await `params` and `searchParams`. A missing product calls `notFound()`.
- Wrap catalog UI that awaits `searchParams` in `Suspense`, with the existing catalog skeleton as the fallback.
- Order placement uses `placeOrderAction` with `useActionState` and `useFormStatus`.
- Page titles use the root template `%s · ShopSphere`.
- Format money with `formatMoney`. Combine class names with `cx`. Icons come from `lucide-react`.

## Tailwind

Tailwind CSS v4 is loaded from `src/app/globals.css`. There is no `tailwind.config`. Style with the tokens defined there: `bg-background`, `bg-surface`, `text-navy`, `font-display`, `border-line`, `text-muted`, `text-danger`, and the brass, success, and warning colors. Match utilities already used by the nearest component. Form fields go through `Field` and `fieldProps`, including the error text and `aria-invalid` / `aria-describedby` wiring.

## Validation and errors

- Validate with Zod and `safeParse`. Map the first issue for each field through `fieldErrorsFromZod`.
- Return a discriminated result: `{ ok: true, ... }`, or `{ ok: false, fieldErrors?, formError? }` or a cart status code. Do not throw for expected validation, stock, or empty-cart failures.
- Invalid catalog `category`, `sort`, and `page` values fall back to the defaults in `parseCatalogQuery`. A page past the end is clamped.
- Treat unreadable cart or confirmation storage as empty. Enforce stock and quantity limits in the cart operations, then reconcile stored lines on read.

## Tests

When behavior changes, update the matching Vitest test in `tests/` and, for a shopper-facing flow, the Playwright spec in `e2e/`. Unit tests call feature functions directly. Component tests use React Testing Library and the Next.js mocks in `tests/setup.tsx`.

Do not claim that a command or test passed unless it was run and its result was observed. The scripts are `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, and `npm run format:check`.

## Change scope

Preserve existing shop behavior unless the task changes it. Do not refactor unrelated code. Do not add a database, authentication, a payment integration, or an external service unless the task explicitly asks for it. Checkout stays simulated, and a successful confirmation still states that no payment was processed.
