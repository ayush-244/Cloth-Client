import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

export const createBooking = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const overlappingBookings = await Booking.countDocuments({
      productId,
      size,
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    });

    if (overlappingBookings >= product.availableStock) {
      const error = new Error("Product not available for selected dates");
      error.statusCode = 400;
      throw error;
    }

    const days =
      (new Date(endDate) - new Date(startDate)) /
      (1000 * 60 * 60 * 24) + 1;

    const totalAmount = days * product.rentPrice;

    const booking = await Booking.create({
      productId,
      startDate,
      endDate,
      size,
      userId: req.user.id,
      totalAmount,
      deposit: product.deposit
    });

    res.status(201).json({
      success: true,
      data: booking
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
