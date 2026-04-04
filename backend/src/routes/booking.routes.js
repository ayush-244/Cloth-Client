import express from "express";
import {
  createBooking,
  getMyBookings,
  returnProduct
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBookingSchema, returnBookingSchema } from "../validations/booking.validation.js";

const router = express.Router();

router.post("/", protect, validate(createBookingSchema), createBooking);
router.get("/my", protect, getMyBookings);
router.post("/return", protect, validate(returnBookingSchema), returnProduct);

export default router;