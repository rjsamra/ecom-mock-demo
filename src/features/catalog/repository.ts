import { products } from "@/data/products";
import type { Category, Product } from "@/types/product";

function cloneProduct(product: Product): Product {
  return { ...product };
}

export function getAllProducts(): Product[] {
  return products.map(cloneProduct);
}

export function getProductById(id: string): Product | null {
  const product = products.find((item) => item.id === id);
  return product ? cloneProduct(product) : null;
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((product) => product.featured);
}

export function getProductsByCategory(category: Category): Product[] {
  return getAllProducts().filter((product) => product.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return getAllProducts()
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}
