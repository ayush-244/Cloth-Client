import express from "express";
import {
  createReview,
  getProductReviews,
  getReviewStatistics,
  checkReviewEligibility,
  getUserReview,
  updateReview,
  deleteReview,
  markHelpful
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTES (no authentication required)
 */

// Get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Get rating statistics for a product
router.get("/stats/:productId", getReviewStatistics);

/**
 * PROTECTED ROUTES (authentication required)
 */

// Create a new review (authenticated users only)
// SIMPLIFIED: Removed validation middleware for now
router.post("/", protect, createReview);

// Get user's review for a product (authenticated users only)
router.get("/user-review/:productId", protect, getUserReview);

// Update a review (authenticated users can edit their own)
router.put("/:id", protect, updateReview);

// Delete a review (authenticated users can delete)
router.delete("/:id", protect, deleteReview);

// Mark review as helpful/unhelpful (authenticated users only)
router.post("/:id/helpful", protect, markHelpful);

export default router;
