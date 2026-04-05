import { razorpay } from "../config/razorpay.js";
import Transaction from "../models/Transaction.js";
import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

export const getRazorpayKey = async (req, res, next) => {
  try {
    const key = process.env.RAZORPAY_KEY;
    
    if (!key) {
      const error = new Error("Razorpay key not configured");
      error.statusCode = 503;
      throw error;
    }

    res.json({ success: true, key });
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    if (!razorpay) {
      const error = new Error("Payment gateway not configured");
      error.statusCode = 503;
      throw error;
    }

    const { amount, items, shippingAddress, rentalStartDate } = req.body;

    if (!items || items.length === 0) {
      const error = new Error("No items provided");
      error.statusCode = 400;
      throw error;
    }

    // Create individual bookings for each item
    const bookings = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        const error = new Error(`Product not found: ${item.productId}`);
        error.statusCode = 404;
        throw error;
      }

      // Calculate end date
      const endDate = new Date(rentalStartDate);
      endDate.setDate(endDate.getDate() + item.rentalDays);

      // Create booking
      const booking = await Booking.create({
        userId: req.user.id,
        productId: item.productId,
        size: item.size || 'M', // Default size
        startDate: new Date(rentalStartDate),
        endDate,
        totalAmount: item.totalPrice || (product.rentPrice * item.rentalDays),
        deposit: Math.round((item.totalPrice || product.rentPrice * item.rentalDays) * 0.2),
        status: 'booked'
      });

      bookings.push(booking);

      // Decrease product stock
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { availableStock: -1 } },
        { new: true }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: bookings[0]._id.toString()
    });

    // Create transaction record linking to first booking
    const transaction = await Transaction.create({
      userId: req.user.id,
      bookingId: bookings[0]._id,
      amount,
      razorpayOrderId: razorpayOrder.id,
      bookingIds: bookings.map(b => b._id) // Store all booking IDs
    });

    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      bookingIds: bookings.map(b => b._id),
      transactionId: transaction._id,
      data: razorpayOrder
    });

  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = await import('crypto');
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.default
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      const error = new Error("Payment signature verification failed");
      error.statusCode = 400;
      throw error;
    }

    // Update transaction
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.status = "paid";
    await transaction.save();

    // Update all associated bookings status
    if (transaction.bookingIds && transaction.bookingIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: transaction.bookingIds } },
        { status: 'confirmed' }
      );
    } else {
      // Fallback to single booking
      await Booking.findByIdAndUpdate(
        transaction.bookingId,
        { status: 'confirmed' },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: transaction
    });

  } catch (err) {
    next(err);
  }
};
