import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * MINIMAL WORKING VERSION - GET PRODUCT REVIEWS
 * No aggregation, no populate complexity
 * Just return reviews with basic data
 */
export const getProductReviews = async (req, res, next) => {
  try {
    console.log("🟡 GET /reviews/product/:productId called");
    const { productId } = req.params;
    console.log("📍 productId from params:", productId);

    // Validate productId format FIRST
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("❌ Invalid ObjectId format:", productId);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // Simple query - no populate
    console.log("🔍 Querying reviews for productId...");
    const reviews = await Review.find({ productId })
      .select("productId rating comment reviewerName createdAt")
      .sort({ createdAt: -1 })
      .lean();

    console.log("✅ Found reviews:", reviews.length);

    // Calculate basic stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        averageRating: parseFloat(averageRating),
        totalReviews
      }
    });
  } catch (err) {
    console.error("💥 GET /reviews error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: err.message
    });
  }
};

/**
 * MINIMAL WORKING VERSION - CREATE REVIEW
 * Accepts: productId, rating, comment
 * Skip all complex validation
 */
export const createReview = async (req, res, next) => {
  try {
    console.log("🟡 POST /reviews called");
    const userId = req.user?.id;
    const { productId, rating, comment } = req.body;

    console.log("📍 Request data:", { userId, productId, rating, comment });

    // Validate required fields
    if (!userId) {
      console.error("❌ No userId from token");
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!productId || !rating) {
      console.error("❌ Missing productId or rating");
      return res.status(400).json({
        success: false,
        message: "productId and rating are required"
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("❌ Invalid productId format:", productId);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // Validate rating is 1-5
    if (rating < 1 || rating > 5) {
      console.error("❌ Invalid rating:", rating);
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Create minimal review
    console.log("💾 Creating review...");
    console.log("📝 Review data:", { productId, userId, rating, comment });
    
    const review = await Review.create({
      productId,
      userId,
      rating,
      comment: comment || "",
      reviewerName: req.user.name || "User"
    });

    console.log("✅ Review created successfully:", review._id);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        _id: review._id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    });
  } catch (err) {
    console.error("💥 POST /reviews error:", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: err.message,
      code: err.code
    });
  }
};

// STUBS FOR OTHER FUNCTIONS - Minimal implementations for now

/**
 * GET REVIEW STATISTICS - Returns rating breakdown for a product
 */
export const getReviewStatistics = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // Get all reviews for stats calculation
    const reviews = await Review.find({ productId }).lean();
    
    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    
    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    // Calculate percentages
    const percentages = {};
    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round((distribution[i] / reviews.length) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length,
        ratingDistribution: distribution,
        percentages
      }
    });
  } catch (err) {
    console.error("💥 GET /stats error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
      error: err.message
    });
  }
};

/**
 * GET USER'S REVIEW FOR A PRODUCT
 * Returns user's review if they already reviewed the product
 */
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const review = await Review.findOne({ productId, userId })
      .select("_id productId rating comment reviewerName createdAt")
      .lean();

    res.status(200).json({
      success: true,
      data: review || null
    });
  } catch (err) {
    console.error("💥 GET /user-review error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user review",
      error: err.message
    });
  }
};

/**
 * CHECK IF USER CAN REVIEW - Placeholder
 */
export const checkReviewEligibility = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

/**
 * UPDATE REVIEW - Placeholder
 */
/**
 * UPDATE REVIEW
 */
export const updateReview = async (req, res) => {
  try {
    console.log("🟡 PUT /reviews/:id called");
    const { id } = req.params;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    console.log("📍 Request data:", { reviewId: id, userId, rating, comment });

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid review ID format:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      console.error("❌ Review not found:", id);
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      console.error("❌ Unauthorized: User does not own this review");
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews"
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      console.error("❌ Invalid rating:", rating);
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Update review
    console.log("💾 Updating review...");
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    
    await review.save();
    console.log("✅ Review updated successfully:", review._id);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        _id: review._id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    });
  } catch (err) {
    console.error("💥 PUT /reviews/:id error:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: err.message
    });
  }
};

/**
 * DELETE REVIEW
 */
export const deleteReview = async (req, res) => {
  try {
    console.log("🟡 DELETE /reviews/:id called");
    const { id } = req.params;
    const userId = req.user?.id;

    console.log("📍 Request data:", { reviewId: id, userId });

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid review ID format:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      console.error("❌ Review not found:", id);
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      console.error("❌ Unauthorized: User does not own this review");
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews"
      });
    }

    // Delete review
    console.log("🗑️ Deleting review...");
    await Review.findByIdAndDelete(id);
    console.log("✅ Review deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (err) {
    console.error("💥 DELETE /reviews/:id error:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: err.message
    });
  }
};

/**
 * MARK HELPFUL
 */
export const markHelpful = async (req, res) => {
  try {
    console.log("🟡 POST /reviews/:id/helpful called");
    const { id } = req.params;
    const { action } = req.body; // 'helpful' or 'unhelpful'

    console.log("📍 Request data:", { reviewId: id, action });

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid review ID format:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format"
      });
    }

    // Validate action
    if (!['helpful', 'unhelpful'].includes(action)) {
      console.error("❌ Invalid action:", action);
      return res.status(400).json({
        success: false,
        message: "Action must be 'helpful' or 'unhelpful'"
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      console.error("❌ Review not found:", id);
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Update helpful/unhelpful count
    console.log("💾 Marking as", action);
    if (action === 'helpful') {
      review.helpful = (review.helpful || 0) + 1;
    } else {
      review.unhelpful = (review.unhelpful || 0) + 1;
    }
    
    await review.save();
    console.log("✅ Review marked as", action, "successfully");

    res.status(200).json({
      success: true,
      message: `Review marked as ${action}`,
      data: {
        _id: review._id,
        helpful: review.helpful,
        unhelpful: review.unhelpful
      }
    });
  } catch (err) {
    console.error("💥 POST /reviews/:id/helpful error:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: "Failed to mark review helpful",
      error: err.message
    });
  }
};
