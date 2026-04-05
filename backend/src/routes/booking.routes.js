import express from "express";
import {
  createBooking,
  getMyBookings,
  returnProduct,
  getAllBookings,
  updateBookingStatus,
  submitReturn,
  checkAvailability
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBookingSchema, returnBookingSchema, checkAvailabilitySchema } from "../validations/booking.validation.js";

const router = express.Router();

// Public route - check availability (no auth required for viewing)
router.post("/check-availability/:productId", validate(checkAvailabilitySchema), checkAvailability);

// Protected routes
router.post("/", protect, validate(createBookingSchema), createBooking);
router.get("/my", protect, getMyBookings);
router.post("/return", protect, validate(returnBookingSchema), returnProduct);

// Admin routes
router.get("/admin/all", protect, isAdmin, getAllBookings);
router.put("/:id/status", protect, isAdmin, updateBookingStatus);
router.put("/:id/return", protect, isAdmin, submitReturn);

export default router;