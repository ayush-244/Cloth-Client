import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },

  bookingIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  }],

  amount: {
    type: Number,
    required: true
  },

  razorpayOrderId: {
    type: String,
    required: true
  },
  
  razorpayPaymentId: String,

  razorpaySignature: String,

  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);