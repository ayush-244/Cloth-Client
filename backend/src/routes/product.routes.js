import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProductSchema } from "../validations/product.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  isAdmin,
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.array("images", 5),
  validate(createProductSchema),
  updateProduct
);

router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;