import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),

  category: Joi.string()
    .valid("men", "women", "footwear")
    .required(),

  rentPrice: Joi.number().positive().required(),

  totalStock: Joi.number().integer().min(0).required(),

  availableStock: Joi.number().integer().min(0).required()
}).unknown(true);