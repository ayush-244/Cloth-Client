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
    enum: ["booked", "returned", "late"],
    default: "booked"
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);