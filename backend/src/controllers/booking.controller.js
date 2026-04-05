import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import { validateBookingAvailability, checkProductAvailability } from "../services/booking.service.js";

export const createBooking = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, size, quantity = 1 } = req.body;

    // Get product to verify it exists
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    // VALIDATE AVAILABILITY (backend protection - critical)
    // This ensures no overbooking even if frontend validation is bypassed
    await validateBookingAvailability(productId, startDate, endDate, quantity);

    // Calculate rental days and total amount
    const days =
      (new Date(endDate) - new Date(startDate)) /
      (1000 * 60 * 60 * 24) + 1;

    const totalAmount = days * product.rentPrice * quantity;

    // Create booking record
    const booking = await Booking.create({
      productId,
      startDate,
      endDate,
      size,
      quantity,
      userId: req.user.id,
      totalAmount,
      deposit: product.deposit
    });

    // Populate product info before sending response
    const populatedBooking = await booking.populate("productId", "name rentPrice images");

    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: "Booking created successfully"
    });

  } catch (err) {
    next(err);
  }
};

/**
 * CHECK AVAILABILITY ENDPOINT
 * Used by frontend to verify if a product is available for rental
 * before adding to cart or proceeding to checkout
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, quantity = 1 } = req.body;

    // Validate required fields
    if (!productId || !startDate || !endDate) {
      const error = new Error("Missing required fields: startDate, endDate");
      error.statusCode = 400;
      throw error;
    }

    if (quantity < 1) {
      const error = new Error("Quantity must be at least 1");
      error.statusCode = 400;
      throw error;
    }

    // Check availability using service
    const availability = await checkProductAvailability(
      productId,
      startDate,
      endDate,
      quantity
    );

    res.json({
      success: true,
      data: availability
    });

  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("productId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

export const returnProduct = async (req, res, next) => {
  try {
    const { bookingId, condition } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    const today = new Date();
    let lateFee = 0;

    if (today > booking.endDate) {
      const lateDays =
        (today - booking.endDate) / (1000 * 60 * 60 * 24);

      lateFee = Math.ceil(lateDays) * 100;
      booking.status = "late";
    }

    let damageFee = 0;

    if (condition === "minor") damageFee = 200;
    if (condition === "heavy") damageFee = 500;

    booking.status = "returned";
    await booking.save();

    res.json({
      success: true,
      message: "Returned successfully",
      data: { lateFee, damageFee, booking }
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN ENDPOINTS
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone")
      .populate("productId", "name rentPrice images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
      total: bookings.length
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["booked", "confirmed", "outForDelivery", "inUse", "returned", "late"];
    
    if (!validStatuses.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate("userId productId");

    res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

export const submitReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnCondition, cleaningRequired, repairRequired } = req.body;

    let damageFee = 0;
    let cleaningFee = 0;

    if (returnCondition === "minorDamage") damageFee = 200;
    if (returnCondition === "heavyDamage") damageFee = 500;
    if (cleaningRequired) cleaningFee = 150;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "returned",
        returnCondition,
        cleaningRequired,
        repairRequired,
        damageFee,
        cleaningFee,
        returnedAt: new Date()
      },
      { new: true }
    ).populate("userId productId");

    res.json({
      success: true,
      message: "Return processed successfully",
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
