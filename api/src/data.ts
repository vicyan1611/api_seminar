import { v4 as uuidv4 } from "uuid";
import { Product, IdempotencyRecord } from "./types";

export const products: Product[] = [];

export const idempotencyStore = new Map<string, IdempotencyRecord>();
const IDEMPOTENCY_RECORD_TTL_MS = 1 * 60 * 1000; // 1 minutes

export const addProduct = (name: string, price: number): Product => {
  const newProduct: Product = {
    id: uuidv4(),
    name,
    price,
    createdAt: new Date(),
  };
  products.push(newProduct);
  return newProduct;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const cleanupIdempotencyStore = () => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.createdAt > IDEMPOTENCY_RECORD_TTL_MS) {
      idempotencyStore.delete(key);
      console.log(`Cleaned up expired idempotency key: ${key}`);
    }
  }
};
