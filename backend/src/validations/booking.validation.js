import Joi from "joi";

export const createBookingSchema = Joi.object({
  productId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
  size: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1)
}).unknown(true);

export const checkAvailabilitySchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
  quantity: Joi.number().integer().min(1).default(1)
}).unknown(true);

export const returnBookingSchema = Joi.object({
  bookingId: Joi.string().required(),
  condition: Joi.string().valid("good", "minor", "heavy").required()
}).unknown(true);
