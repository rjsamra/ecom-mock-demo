# ShopSphere

ShopSphere is a mock retail storefront for brownfield development exercises. It sells electronics, clothing, home goods, and accessories from a local catalog. Checkout is simulated: the app validates the order and shows a confirmation, and it does not take payment or create a fulfillment record.

## Stack

- Next.js App Router with Cache Components
- React and TypeScript in strict mode
- Tailwind CSS
- Zod
- Lucide React
- Vitest and React Testing Library
- Playwright
- ESLint and Prettier

## Setup

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Playwright needs a browser before the end-to-end script will run:

```bash
npx playwright install chromium
```

## Scripts

| Script                 | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the local dev server                  |
| `npm run build`        | Production build                            |
| `npm run start`        | Serve the production build                  |
| `npm run lint`         | ESLint                                      |
| `npm run typecheck`    | Generate route types and run `tsc --noEmit` |
| `npm run test`         | Unit and component tests                    |
| `npm run test:watch`   | Unit tests in watch mode                    |
| `npm run test:e2e`     | Playwright end-to-end tests                 |
| `npm run format`       | Format with Prettier                        |
| `npm run format:check` | Check Prettier formatting                   |

## Routes

| Route               | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `/`                 | Home, with a hero, categories, featured products, and promotions |
| `/products`         | Search, category filters, sorting, and pagination                |
| `/products/[id]`    | Product details, stock, quantity, and add to cart                |
| `/cart`             | Quantity updates, removal, and the order summary                 |
| `/checkout`         | Customer details, validation, and a simulated confirmation       |
| `GET /api/products` | Catalog JSON using the same query rules as the shop              |

Listing and API queries accept `q`, `category`, `sort`, and `page`.

Sort values are `featured`, `price-asc`, `price-desc`, `rating`, and `name`. Categories are `electronics`, `clothing`, `home`, and `accessories`.

## Architecture

Server Components render the catalog. Client Components are limited to the cart, header, quantity controls, sorting, and checkout form.

- `src/app` routes, layouts, and the products API
- `src/components` shared storefront UI
- `src/features/catalog` catalog data access, search, filtering, sorting, and pagination
- `src/features/cart` cart changes, stock limits, and price calculation
- `src/features/checkout` Zod validation and order placement
- `src/data/products.ts` the product seed
- `src/lib` small shared helpers
- `tests` unit and component tests
- `e2e` browser tests

Prices are integer cents. `quoteCart` and `placeOrder` look up the price and stock from the catalog. A price sent by the browser is ignored.

`placeOrder` is a plain function. `placeOrderAction` is the Server Action that reads the form and calls it. The cart stores only a product id and a quantity.

## Business rules

- The shop has 32 products, eight in each category. Four are featured.
- Product pages show eight items at a time.
- Search matches the name, description, and category label, and it is case-insensitive.
- Invalid category, sort, and page values fall back to the defaults. A page past the end is clamped.
- Adding the same product increases its quantity. The quantity cannot pass the catalog stock. Sold-out products cannot be added.
- A stored cart is reconciled when it is read. Unknown or sold-out lines are removed, and quantities above stock are reduced.
- Shipping is $8.95. It is free when the merchandise subtotal is $75.00 or more. An empty cart has no shipping charge. The rate does not change by country.
- The order total is the catalog subtotal plus shipping. There is no tax.
- Checkout accepts the United States, Canada, and the United Kingdom. Postal codes are checked for the selected country.
- A successful order gets a reference shaped like `SS-` followed by eight characters. The same customer, lines, and timestamp produce the same reference.
- The confirmation says that no payment was processed.

## Assumptions

- There is no account system, payment provider, or database.
- The last confirmation is kept in `sessionStorage` so a refresh of checkout can show it again. It is not stored on the server.
- The cart is kept in `localStorage` under `shopsphere.cart.v1`.
- Product images are local illustrations in `public/products`. If an image fails to load, the product frame shows a fallback.

## Tests

Unit tests cover search, filtering, sorting, pagination, cart changes, stock limits, shipping, checkout validation, and both successful and rejected orders. Component tests cover the product card and the checkout form. Playwright covers the main shopper journey, an empty search, invalid checkout, a sold-out product, the stock limit, cart reload, and the mobile menu.
