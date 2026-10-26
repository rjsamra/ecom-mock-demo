import { getProductById } from "@/features/catalog/repository";
import { CheckoutExperience } from "@/features/checkout/components/checkout-experience";
import { CartProvider } from "@/features/cart/cart-provider";
import { ProductCard } from "@/components/product-card";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("ProductCard", () => {
  it("links to the product and shows the catalog price", () => {
    const product = getProductById("aero-buds-pro");
    expect(product).not.toBeNull();
    if (!product) {
      return;
    }

    render(<ProductCard product={product} />);

    const link = screen.getByRole("link", { name: /AeroBuds Pro/ });
    expect(link.getAttribute("href")).toBe("/products/aero-buds-pro");
    expect(screen.getByText("$129.00")).toBeTruthy();
    expect(screen.getByText("In stock")).toBeTruthy();
  });
});

describe("CheckoutExperience", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("shows validation errors and does not confirm the order", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider initialLines={[{ productId: "cedar-candle", quantity: 1 }]}>
        <CheckoutExperience />
      </CartProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Checkout" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Place order" }));

    expect(await screen.findByText("Enter your full name.")).toBeTruthy();
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(screen.queryByText(/Order confirmed/)).toBeNull();
  });

  it("places a simulated order at the catalog price", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider initialLines={[{ productId: "cedar-candle", quantity: 1 }]}>
        <CheckoutExperience />
      </CartProvider>,
    );

    expect(await screen.findByLabelText("Full name")).toBeTruthy();
    await user.type(screen.getByLabelText("Full name"), "Avery Chen");
    await user.type(screen.getByLabelText("Email"), "avery@example.com");
    await user.type(screen.getByLabelText("Phone"), "4155550138");
    await user.type(screen.getByLabelText("Street address"), "18 Market Street");
    await user.type(screen.getByLabelText("City"), "San Francisco");
    await user.type(screen.getByLabelText("State or region"), "CA");
    await user.type(screen.getByLabelText("Postal code"), "94107");
    await user.click(screen.getByRole("button", { name: "Place order" }));

    expect(
      await screen.findByRole("heading", { name: /Thank you, Avery Chen/ }),
    ).toBeTruthy();
    expect(screen.getByText(/SS-[A-Z0-9]{8}/)).toBeTruthy();
    expect(screen.getByText(/No payment has been processed/)).toBeTruthy();
    expect(screen.getAllByText("$28.00").length).toBeGreaterThan(0);
    expect(screen.getByText("$8.95")).toBeTruthy();
    expect(screen.getByText("$36.95")).toBeTruthy();
  });
});
