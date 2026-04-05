export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    // Determine which part of request to validate
    const dataToValidate = req[source] || {};

    // Skip validation if the source is empty (for optional query/params)
    if (!dataToValidate || typeof dataToValidate !== 'object' || Object.keys(dataToValidate).length === 0) {
      return next();
    }

    // Normalize keys (trim spaces) for body validation
    let cleanData = dataToValidate;
    if (source === 'body') {
      cleanData = Object.fromEntries(
        Object.entries(dataToValidate).map(([key, value]) => [key.trim(), value])
      );
    }

    // Validate with type conversion (critical for query params)
    const { error, value } = schema.validate(cleanData, {
      abortEarly: false,
      convert: true  // Converts string query params to correct types (e.g., "1" -> 1)
    });

    if (error) {
      // Log detailed error for debugging
      console.error(`[Validation Error - ${source}]:`, {
        field: error.details[0].context.label || error.details[0].path.join('.'),
        message: error.details[0].message,
        type: error.details[0].type,
        receivedData: cleanData
      });
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(err => `${err.context.label || err.path.join('.')}: ${err.message}`)
      });
    }

    // CRITICAL: Update the request with validated AND converted data
    // This ensures controllers receive properly typed values
    req[source] = value;
    next();
  } catch (err) {
    console.error(`[Validate Middleware Error - ${source}]:`, err.message);
    res.status(500).json({
      success: false,
      message: "Validation middleware error",
      error: err.message
    });
  }
};