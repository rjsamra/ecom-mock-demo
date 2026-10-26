import { CATEGORIES, type Category } from "@/types/product";

export const CATEGORY_CONTENT: Record<Category, { label: string; description: string }> =
  {
    electronics: {
      label: "Electronics",
      description: "Audio, power, and desk tools.",
    },
    clothing: {
      label: "Clothing",
      description: "Layers for work and the weekend.",
    },
    home: {
      label: "Home and living",
      description: "Objects for the table and the room.",
    },
    accessories: {
      label: "Accessories",
      description: "Small goods for every day.",
    },
  };

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category === value);
}

export function categoryLabel(category: Category): string {
  return CATEGORY_CONTENT[category].label;
}
