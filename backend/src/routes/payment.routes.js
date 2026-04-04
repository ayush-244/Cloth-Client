import express from "express";
import {
  createOrder,
  verifyPayment
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validations/payment.validation.js";

const router = express.Router();

router.post("/create-order", protect, validate(createOrderSchema), createOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);

export default router;
