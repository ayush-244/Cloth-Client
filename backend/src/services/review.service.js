import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

/**
 * CHECK REVIEW ELIGIBILITY (CRITICAL BUSINESS LOGIC)
 * Users can ONLY review if:
 * 1. They own the order (booking)
 * 2. Order status is 'returned' (completed rental)
 * 3. They haven't already reviewed this product from this order
 */
export const checkReviewEligibility = async (userId, orderId, productId) => {
  // Validate order exists and belongs to user
  const order = await Booking.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // Check order ownership
  if (order.userId.toString() !== userId.toString()) {
    const error = new Error("You can only review your own orders");
    error.statusCode = 403;
    throw error;
  }

  // Check order status is 'returned' (rental completed)
  if (order.status !== "returned") {
    const error = new Error("Review allowed only after completing the rental");
    error.statusCode = 400;
    throw error;
  }

  // Verify product matches the order
  if (order.productId.toString() !== productId.toString()) {
    const error = new Error("Product does not match the order");
    error.statusCode = 400;
    throw error;
  }

  return order;
};

/**
 * CHECK FOR DUPLICATE REVIEWS
 * Prevent user from reviewing the same product from the same order twice
 * Uses unique constraint on orderId in schema as primary protection
 */
export const checkDuplicateReview = async (orderId) => {
  const existingReview = await Review.findOne({ orderId });

  if (existingReview) {
    const error = new Error("You have already reviewed this rental");
    error.statusCode = 400;
    throw error;
  }

  return true;
};

/**
 * CREATE REVIEW - Authenticated Users Only
 * Returns created review with user/reviewer details
 */
export const createReview = async ({ productId, orderId, userId, reviewerName, reviewerEmail, rating, comment }) => {
  // Validate userId is provided (required for auth)
  if (!userId) {
    const error = new Error("Authentication required to create a review");
    error.statusCode = 401;
    throw error;
  }

  // Create review with authenticated user
  const review = await Review.create({
    productId,
    orderId: orderId || null,  // Optional
    userId: userId,            // Required
    reviewerName: reviewerName || null,  // Optional - can be user's name
    reviewerEmail: reviewerEmail || null,
    rating,
    comment: comment || ""
  });

  // Update product rating aggregations
  await review.updateProductRating();

  // Return populated review
  return await review
    .populate("userId", "name email")
    .populate("productId", "name")
    .exec();
};

/**
 * GET PRODUCT REVIEWS with pagination and sorting
 * Includes average rating calculation for response
 */
export const getProductReviews = async (productId, { page = 1, limit = 10, sortBy = "recent" }) => {
  try {
    // CRITICAL FIX: Convert productId to ObjectId for MongoDB queries
    const objectId = new mongoose.Types.ObjectId(productId);

    // Validate pagination inputs
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, Math.min(50, parseInt(limit) || 10));

    // Build sort object based on sortBy parameter
    const sortMap = {
      recent: { createdAt: -1 },
      helpful: { helpful: -1, createdAt: -1 },
      "rating-high": { rating: -1, createdAt: -1 },
      "rating-low": { rating: 1, createdAt: -1 }
    };

    const sort = sortMap[sortBy] || sortMap.recent;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch reviews with pagination - use ObjectId for query
    const reviews = await Review.find({ productId: objectId })
      .populate("userId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean()
      .exec();

    // Get total count for pagination metadata
    const totalReviews = await Review.countDocuments({ productId: objectId });

    // Get product aggregations - findById auto-converts to ObjectId
    const product = await Product.findById(objectId).select("averageRating totalReviews ratingDistribution");

    return {
      reviews,
      averageRating: product?.averageRating || 0,
      totalReviews: product?.totalReviews || 0,
      ratingDistribution: product?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      }
    };
  } catch (error) {
    // Detailed error logging for debugging
    console.error(`[Review Service] getProductReviews error for productId ${productId}:`, error.message);
    
    // Re-throw with proper context
    const err = new Error(`Failed to fetch reviews: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }
};

/**
 * GET USER'S REVIEW FOR A PRODUCT
 * Used to check if user already reviewed a product (for UI purposes)
 */
export const getUserProductReview = async (userId, productId) => {
  return await Review.findOne({ userId, productId })
    .select("_id rating comment createdAt")
    .lean()
    .exec();
};

/**
 * UPDATE REVIEW - Authenticated Users Only
 * User can only update their own review (or admin can update any)
 * Returns updated review
 */
export const updateReview = async (reviewId, userId, updateData) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  // Check ownership - convert both to strings for comparison
  const reviewUserId = review.userId.toString();
  const currentUserId = userId.toString();
  
  if (reviewUserId !== currentUserId) {
    const error = new Error("You can only edit your own reviews");
    error.statusCode = 403;
    throw error;
  }

  // Update allowed fields
  if (updateData.rating !== undefined) {
    review.rating = updateData.rating;
  }
  if (updateData.comment !== undefined) {
    review.comment = updateData.comment;
  }
  if (updateData.reviewerName !== undefined) {
    review.reviewerName = updateData.reviewerName;
  }

  await review.save();

  // Recalculate product ratings
  await review.updateProductRating();

  return await review
    .populate("userId", "name")
    .populate("productId", "name")
    .exec();
};

/**
 * DELETE REVIEW - Authenticated Users Only
 * User can delete their own review (or admin can delete any)
 */
export const deleteReview = async (reviewId, userId, isAdmin) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  // Check authorization: user owns review or is admin
  const reviewUserId = review.userId.toString();
  const currentUserId = userId.toString();
  
  if (!isAdmin && reviewUserId !== currentUserId) {
    const error = new Error("You can only delete your own reviews");
    error.statusCode = 403;
    throw error;
  }

  const productId = review.productId;
  await Review.findByIdAndDelete(reviewId);

  // Recalculate product ratings after deletion
  const updatedReview = new Review({ productId });
  await updatedReview.updateProductRating();

  return true;
};

/**
 * GET REVIEW STATISTICS FOR PRODUCT
 * Returns rating distribution and summary statistics
 */
export const getReviewStatistics = async (productId) => {
  const product = await Product.findById(productId).select(
    "averageRating totalReviews ratingDistribution"
  );

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const distribution = product.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = product.totalReviews || 0;

  // Calculate percentages
  const percentages = {
    5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0
  };

  return {
    averageRating: product.averageRating || 0,
    totalReviews: total,
    ratingDistribution: distribution,
    percentages
  };
};

/**
 * MARK REVIEW AS HELPFUL
 * Used when user clicks "helpful" button
 */
export const markHelpful = async (reviewId, action = "helpful") => {
  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (action === "helpful") {
    review.helpful += 1;
  } else if (action === "unhelpful") {
    review.unhelpful += 1;
  }

  await review.save();
  return review;
};

/**
 * GET REVIEW BY EMAIL
 * Finds review by reviewer email (for anonymous users)
 * Used to check if email has already reviewed a product
 */
export const getReviewByEmail = async (email, productId) => {
  return await Review.findOne({ reviewerEmail: email, productId })
    .select("_id rating comment createdAt reviewerName")
    .lean()
    .exec();
};
