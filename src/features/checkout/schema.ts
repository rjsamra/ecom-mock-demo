import { z } from "zod";

export const COUNTRIES = ["United States", "Canada", "United Kingdom"] as const;

export type Country = (typeof COUNTRIES)[number];

const US_POSTAL = /^\d{5}(-\d{4})?$/;
const CA_POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const UK_POSTAL = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function postalCodeMessage(country: Country): string {
  switch (country) {
    case "United States":
      return "Enter a 5-digit ZIP code.";
    case "Canada":
      return "Enter a Canadian postal code, such as K1A 0B1.";
    case "United Kingdom":
      return "Enter a UK postcode, such as SW1A 1AA.";
  }
}

export function isPostalCodeValid(country: Country, postalCode: string): boolean {
  switch (country) {
    case "United States":
      return US_POSTAL.test(postalCode);
    case "Canada":
      return CA_POSTAL.test(postalCode);
    case "United Kingdom":
      return UK_POSTAL.test(postalCode);
  }
}

export const checkoutSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(80, "Name must be 80 characters or fewer."),
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(20, "Enter a valid phone number.")
      .regex(/^[0-9+().\-\s]+$/, "Enter a valid phone number.")
      .refine((value) => {
        const digits = value.replace(/\D/g, "").length;
        return digits >= 7 && digits <= 15;
      }, "Enter a valid phone number."),
    addressLine1: z
      .string()
      .trim()
      .min(5, "Enter a street address.")
      .max(120, "Street address must be 120 characters or fewer."),
    addressLine2: z
      .string()
      .trim()
      .max(120, "Address line 2 must be 120 characters or fewer."),
    city: z
      .string()
      .trim()
      .min(2, "Enter a city.")
      .max(80, "City must be 80 characters or fewer."),
    region: z
      .string()
      .trim()
      .min(2, "Enter a state or region.")
      .max(80, "State or region must be 80 characters or fewer."),
    postalCode: z
      .string()
      .trim()
      .min(3, "Enter a postal code.")
      .max(12, "Postal code must be 12 characters or fewer."),
    country: z.enum(COUNTRIES, { error: "Select a country." }),
  })
  .superRefine((value, ctx) => {
    if (!isPostalCodeValid(value.country, value.postalCode)) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: postalCodeMessage(value.country),
      });
    }
  });

export type CheckoutDetails = z.infer<typeof checkoutSchema>;

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && fieldErrors[key] === undefined) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
