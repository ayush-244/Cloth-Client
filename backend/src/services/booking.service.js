import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

/**
 * Check product availability for a given date range and quantity
 * 
 * @param {string} productId - Product ID
 * @param {Date} startDate - Rental start date
 * @param {Date} endDate - Rental end date
 * @param {number} quantity - Quantity requested
 * @returns {Promise<{available: boolean, availableStock: number, message: string}>}
 */
export const checkProductAvailability = async (productId, startDate, endDate, quantity = 1) => {
  // Validate inputs
  if (!productId || !startDate || !endDate) {
    throw new Error("Missing required parameters: productId, startDate, endDate");
  }

  if (new Date(endDate) < new Date(startDate)) {
    throw new Error("End date must be after or equal to start date");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Fetch product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // Normalize dates (set time to midnight UTC for consistent comparison)
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setUTCHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setUTCHours(23, 59, 59, 999);

  /**
   * AVAILABILITY ALGORITHM
   * 
   * Find all bookings that overlap with requested date range
   * where status is NOT 'returned' or 'cancelled'
   * 
   * Two date ranges overlap if:
   * (requestedStartDate <= existingEndDate) AND (requestedEndDate >= existingStartDate)
   */
  const overlappingBookings = await Booking.find({
    productId,
    status: { $nin: ["returned", "cancelled"] },
    startDate: { $lte: normalizedEndDate },
    endDate: { $gte: normalizedStartDate }
  }).lean().exec();

  // Sum up all booked quantities for overlapping bookings
  const totalBookedQuantity = overlappingBookings.reduce((sum, booking) => {
    return sum + (booking.quantity || 1);
  }, 0);

  // Calculate available stock
  const availableStock = product.totalStock - totalBookedQuantity;

  // Determine if requested quantity can be fulfilled
  const isAvailable = availableStock >= quantity;

  const response = {
    available: isAvailable,
    availableStock: Math.max(0, availableStock),
    totalStock: product.totalStock,
    bookedQuantity: totalBookedQuantity,
    message: ""
  };

  if (isAvailable) {
    response.message = "Available";
  } else if (availableStock > 0) {
    response.message = `Only ${availableStock} item(s) available for selected dates`;
  } else {
    response.message = "Not available for selected dates";
  }

  return response;
};

/**
 * Get booking conflicts for a product within a date range
 * Useful for admin to see what bookings are conflicting
 * 
 * @param {string} productId - Product ID
 * @param {Date} startDate - Query start date
 * @param {Date} endDate - Query end date
 * @returns {Promise<Array>} Array of overlapping bookings
 */
export const getBookingConflicts = async (productId, startDate, endDate) => {
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setUTCHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setUTCHours(23, 59, 59, 999);

  const conflicts = await Booking.find({
    productId,
    status: { $nin: ["returned", "cancelled"] },
    startDate: { $lte: normalizedEndDate },
    endDate: { $gte: normalizedStartDate }
  })
    .populate("userId", "name email phone")
    .sort({ startDate: 1 });

  return conflicts;
};

/**
 * Validate booking can be created without conflicts
 * Used internally during booking creation
 * 
 * @param {string} productId - Product ID
 * @param {Date} startDate - Rental start date
 * @param {Date} endDate - Rental end date
 * @param {number} quantity - Quantity to book
 * @throws {Error} If booking would exceed stock
 */
export const validateBookingAvailability = async (productId, startDate, endDate, quantity = 1) => {
  const availability = await checkProductAvailability(productId, startDate, endDate, quantity);

  if (!availability.available) {
    const error = new Error(availability.message);
    error.statusCode = 400;
    error.code = "BOOKING_UNAVAILABLE";
    throw error;
  }

  return availability;
};
