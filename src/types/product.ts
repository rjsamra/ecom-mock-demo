export const CATEGORIES = ["electronics", "clothing", "home", "accessories"] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  description: string;
  category: Category;
  priceCents: number;
  rating: number;
  stock: number;
  image: string;
  featured: boolean;
};
