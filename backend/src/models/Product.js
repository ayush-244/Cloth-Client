import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  category: {
    type: String,
    enum: ["men", "women", "footwear"],
    required: true
  },

  sizes: [String],

  rentPrice: { type: Number, required: true },
  buyPrice: Number,
  deposit: { type: Number, default: 0 },

  images: { type: [String], required: true },
  description: String,

  totalStock: { type: Number, required: true },
  availableStock: { type: Number, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Rating aggregations (denormalized for performance)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },

  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },

  ratingDistribution: {
    type: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    },
    default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }

}, { timestamps: true });

export default mongoose.model("Product", productSchema);