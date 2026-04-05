import Joi from "joi";

export const createOrderSchema = Joi.object({
  amount: Joi.number().required(),
  items: Joi.array().required(),
  shippingAddress: Joi.object().required(),
  rentalStartDate: Joi.string().required()
}).unknown(true);

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required()
}).unknown(true);
