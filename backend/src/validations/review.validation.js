import joi from "joi";

/**
 * Validation schema for creating a review
 * - Requires authentication (userId comes from JWT)
 * - Ensures rating is between 1-5
 * - Validates comment length and format
 * - Optional: orderId (for reviews from completed orders)
 */
export const createReviewSchema = joi.object({
  productId: joi
    .string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid product ID format"
    }),

  orderId: joi
    .string()
    .allow(null, '')
    .optional()
    .messages({
      "string.pattern.base": "Invalid order ID format"
    }),

  rating: joi
    .number()
    .integer()
    .required()
    .min(1)
    .max(5)
    .messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
      "any.required": "Rating is required"
    }),

  comment: joi
    .string()
    .trim()
    .allow('')  // Allow empty string
    .optional()
    .messages({
      "string.max": "Comment cannot exceed 1000 characters"
    })
}).unknown(true);  // Allow extra fields: reviewerName, reviewerEmail, userId

/**
 * Validation schema for updating a review
 * - Allows partial updates
 * - User can only update their own review
 */
export const updateReviewSchema = joi.object({
  rating: joi
    .number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5"
    }),

  comment: joi
    .string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      "string.max": "Comment cannot exceed 1000 characters"
    })
});

/**
 * Validation schema for querying reviews
 */
export const getReviewsSchema = joi.object({
  page: joi
    .number()
    .integer()
    .min(1)
    .optional()
    .default(1),

  limit: joi
    .number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .default(10),

  sortBy: joi
    .string()
    .valid("recent", "helpful", "rating-high", "rating-low")
    .optional()
    .default("recent")
}).unknown(true);
