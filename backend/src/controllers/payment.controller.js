import { razorpay } from "../config/razorpay.js";
import Transaction from "../models/Transaction.js";
import Booking from "../models/Booking.js";

export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    const amount = booking.totalAmount + booking.deposit;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    await Transaction.create({
      userId: req.user.id,
      bookingId,
      amount,
      razorpayOrderId: order.id
    });

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.status = "paid";

    await transaction.save();

    res.json({
      success: true,
      message: "Payment successful",
      data: transaction
    });

  } catch (err) {
    next(err);
  }
};
