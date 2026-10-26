"use server";

import { getAllProducts } from "@/features/catalog/repository";
import { placeOrder, type PlaceOrderResult } from "@/features/checkout/place-order";

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readLines(formData: FormData): unknown {
  const value = formData.get("lines");
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export async function placeOrderAction(
  _previous: PlaceOrderResult | null,
  formData: FormData,
): Promise<PlaceOrderResult> {
  return placeOrder({
    customer: {
      fullName: readText(formData, "fullName"),
      email: readText(formData, "email"),
      phone: readText(formData, "phone"),
      addressLine1: readText(formData, "addressLine1"),
      addressLine2: readText(formData, "addressLine2"),
      city: readText(formData, "city"),
      region: readText(formData, "region"),
      postalCode: readText(formData, "postalCode"),
      country: readText(formData, "country"),
    },
    lines: readLines(formData),
    catalog: getAllProducts(),
    placedAt: new Date(),
  });
}
