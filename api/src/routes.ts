import { Router } from "express";
import {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "./controller";

const router = Router();

router.get("/products", listProducts);
router.post("/products", createProduct);

router.get("/products/:id", getProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
export default router;
