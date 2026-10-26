import { expect, test } from "@playwright/test";

test("shopper can browse, update the cart, and place a simulated order", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Everyday goods, chosen with care." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Shop all" }).click();
  await page
    .getByRole("group", { name: "Category" })
    .getByRole("link", { name: "Clothing", exact: true })
    .click();
  await page.getByRole("link", { name: /Meridian Wool Overcoat/ }).click();
  await expect(
    page.getByRole("heading", { name: "Meridian Wool Overcoat" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("status")).toContainText("added to your cart");
  await page.getByRole("link", { name: "Cart, 1 item" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();

  await page
    .getByRole("listitem")
    .getByRole("button", { name: "Increase quantity" })
    .click();
  await expect(page.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("2");
  const summary = page.getByRole("region", { name: "Order summary" });
  await expect(summary).toContainText("$496.00");
  await expect(summary).toContainText("Free");

  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel("Full name").fill("Avery Chen");
  await page.getByLabel("Email").fill("avery@example.com");
  await page.getByLabel("Phone").fill("4155550138");
  await page.getByLabel("Street address").fill("18 Market Street");
  await page.getByLabel("City").fill("San Francisco");
  await page.getByLabel("State or region").fill("CA");
  await page.getByLabel("Postal code").fill("94107");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(
    page.getByRole("heading", { name: /Thank you, Avery Chen/ }),
  ).toBeVisible();
  await expect(page.getByText(/SS-[A-Z0-9]{8}/)).toBeVisible();
  await expect(page.getByText("No payment has been processed")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("$496.00");
});

test("search with no matches shows an empty state", async ({ page }) => {
  await page.goto("/products?q=zzzz-not-a-product");
  await expect(page.getByRole("heading", { name: "No matching products" })).toBeVisible();
});

test("checkout explains invalid customer details", async ({ page }) => {
  await page.goto("/products/cedar-candle");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText(/Order confirmed/)).toHaveCount(0);
});

test("sold-out products cannot be added", async ({ page }) => {
  await page.goto("/products/drift-smart-speaker");
  await expect(page.getByText("Out of stock")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeDisabled();
});

test("quantity cannot exceed stock", async ({ page }) => {
  await page.goto("/products/lumen-portable-charger");
  await expect(page.getByText("Only 2 left")).toBeVisible();
  const quantity = page.getByRole("spinbutton", { name: "Quantity" });
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(quantity).toHaveValue("2");
  await expect(page.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart, 2 items" }).click();
  await expect(page.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("2");
});

test("the cart survives a reload", async ({ page }) => {
  await page.goto("/products/leather-key-loop");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
});

test("mobile navigation can open the shop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("summary", { hasText: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("link", { name: "Shop", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Shop", exact: true }),
  ).toBeVisible();
});
