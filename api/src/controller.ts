import { Request, Response } from "express";
import {
  products,
  addProduct,
  getProductById,
  idempotencyStore,
  cleanupIdempotencyStore,
} from "./data";
import { PaginatedResponse, Product, IdempotencyRecord } from "./types";

// GET /products - List products with pagination
export const listProducts = (req: Request, res: Response) => {
  // --- Pagination ---
  const defaultLimit = 10;
  const defaultOffset = 0;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const offset = parseInt(req.query.offset as string) || defaultOffset;

  const paginatedProducts = products.slice(offset, offset + limit);

  const response: PaginatedResponse<Product> = {
    totalItems: products.length,
    items: paginatedProducts,
    limit: limit,
    offset: offset,
  };

  res.status(200).json(response);
};

// GET /products/:id - Get a specific product
export const getProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = getProductById(id);

  if (!product) {
    res
      .status(404)
      .json({ error: { message: `Product with id ${id} not found` } });
  } else res.status(200).json(product);
};

// POST /products - Create a new product with Idempotency check
export const createProduct = (req: Request, res: Response) => {
  const { name, price } = req.body;

  if (!name || typeof price !== "number" || price <= 0) {
    res.status(400).json({
      error: {
        message:
          "Invalid input: name (string) and price (positive number) are required.",
      },
    });
  } else {
    // --- Idempotency Check ---
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (idempotencyKey) {
      cleanupIdempotencyStore();

      const existingRecord = idempotencyStore.get(idempotencyKey);
      if (existingRecord) {
        console.log(`Idempotency key hit: ${idempotencyKey}`);
        res.status(existingRecord.statusCode).json(existingRecord.responseBody);
      }
    } else {
      // --- Process Request ---
      const newProduct = addProduct(name, price);

      // --- Store Result for Idempotency ---
      if (idempotencyKey) {
        const record: IdempotencyRecord = {
          responseBody: newProduct,
          statusCode: 201,
          createdAt: Date.now(),
        };
        idempotencyStore.set(idempotencyKey, record);
        console.log(`Stored response for idempotency key: ${idempotencyKey}`);
      }

      res.status(201).json(newProduct);
    }
  }
};

// PUT /products/:id - Update a product (inherently idempotent)
export const updateProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    res
      .status(404)
      .json({ error: { message: `Product with id ${id} not found` } });
  } else if (!name || typeof price !== "number" || price <= 0) {
    res.status(400).json({
      error: {
        message:
          "Invalid input: name (string) and price (positive number) are required for update.",
      },
    });
  }

  const updatedProduct = { ...products[productIndex], name, price };
  products[productIndex] = updatedProduct;

  res.status(200).json(updatedProduct);
};

// DELETE /products/:id - Delete a product (inherently idempotent)
export const deleteProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    res
      .status(404)
      .json({ error: { message: `Product with id ${id} not found` } });
  } else {
    products.splice(productIndex, 1);
    res.status(204).send(); // 204 No Content is standard for successful DELETE
  }
};
