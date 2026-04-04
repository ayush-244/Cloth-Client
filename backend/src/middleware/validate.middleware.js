export const validate = (schema) => (req, res, next) => {
  // Normalize keys (trim spaces)
  const cleanBody = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => [key.trim(), value])
  );

  const { error, value } = schema.validate(cleanBody, {
    abortEarly: false,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(err => err.message)
    });
  }

  req.body = value;
  next();
};