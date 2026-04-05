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
    required: true
  },

  size: {
    type: String,
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
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

export default mongoose.model("Booking", bookingSchema);