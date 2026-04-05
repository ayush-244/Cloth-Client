import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },

  size: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },

  startDate: {
    type: Date,
    required: true,
    index: true
  },
  
  endDate: {
    type: Date,
    required: true,
    index: true
  },

  totalAmount: {
    type: Number,
    required: true
  },
  
  deposit: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["booked", "confirmed", "outForDelivery", "inUse", "returned", "late"],
    default: "booked"
  },

  returnCondition: {
    type: String,
    enum: ["good", "minorDamage", "heavyDamage"],
    default: null
  },

  cleaningRequired: {
    type: Boolean,
    default: false
  },

  repairRequired: {
    type: Boolean,
    default: false
  },

  damageFee: {
    type: Number,
    default: 0
  },

  cleaningFee: {
    type: Number,
    default: 0
  },

  returnedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

// Composite index for efficient booking conflict queries
bookingSchema.index({ productId: 1, startDate: 1, endDate: 1 });
// Index for filtering by status
bookingSchema.index({ status: 1 });
// Index for user bookings
bookingSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);