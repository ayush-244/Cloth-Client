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
  }

}, { timestamps: true });

export default mongoose.model("Product", productSchema);