import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Core fields
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,  // Required - authentication is mandatory
    index: true
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false  // Optional - not all reviews need to be from orders
  },

  // Anonymous reviewer info
  reviewerName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: "Anonymous"  // Default name if no userId provided
  },

  reviewerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: null  // Optional email for anonymous reviewers
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    enum: [1, 2, 3, 4, 5]
  },

  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ""
  },

  // Metadata for moderation and analytics
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },

  unhelpful: {
    type: Number,
    default: 0,
    min: 0
  },

  isVerifiedPurchase: {
    type: Boolean,
    default: true  // Always true since we validate order ownership
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for optimal query performance
reviewSchema.index({ productId: 1, createdAt: -1 }, { name: "idx_product_date" });
reviewSchema.index({ userId: 1, productId: 1 }, { name: "idx_user_product" });
reviewSchema.index({ productId: 1, rating: 1 }, { name: "idx_product_rating" });

// Fix for orderId: allow multiple null values using sparse index
// This prevents "E11000 duplicate key error" when orderId is null
reviewSchema.index({ orderId: 1 }, { sparse: true, name: "idx_order_id" });

// Virtual to check if review is recent (within 7 days)
reviewSchema.virtual("isRecent").get(function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.createdAt > sevenDaysAgo;
});

// Pre-save validation - DISABLED TEMPORARILY for debugging
// reviewSchema.pre("save", async function(next) {
//   try {
//     if (!this.isModified("comment")) {
//       return next();
//     }
//     this.comment = this.comment
//       .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
//       .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
//       .trim();
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Post-save hook to update product aggregations (called by controller/service)
// We don't do it in middleware to avoid circular dependencies
reviewSchema.methods.updateProductRating = async function() {
  const Review = mongoose.model("Review");
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { productId: this.productId } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating"
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const { averageRating, totalReviews, ratingDistribution } = stats[0];

    // Calculate rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    await Product.findByIdAndUpdate(
      this.productId,
      {
        averageRating: Math.round(averageRating * 10) / 10,  // Round to 1 decimal
        totalReviews,
        ratingDistribution: distribution
      },
      { new: true }
    );
  }
};

export default mongoose.model("Review", reviewSchema);
