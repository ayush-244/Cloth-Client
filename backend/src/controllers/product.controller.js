import Product from "../models/Product.js";

const sanitizeInput = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.trim(), value])
  );
};

const extractImageUrls = (files) => {
  return files && files.length > 0
    ? files.map(file => file.path)
    : [];
};

const convertToNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
};

const validateProductInput = (cleanBody, imageUrls = null) => {
  const requiredFields = ['name', 'category', 'rentPrice', 'totalStock', 'availableStock'];
  const missingFields = requiredFields.filter(field => !cleanBody[field]);

  if (missingFields.length > 0) {
    const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const rentPrice = convertToNumber(cleanBody.rentPrice, 'rentPrice');
  const totalStock = convertToNumber(cleanBody.totalStock, 'totalStock');
  const availableStock = convertToNumber(cleanBody.availableStock, 'availableStock');

  if (availableStock > totalStock) {
    const error = new Error('availableStock cannot be greater than totalStock');
    error.statusCode = 400;
    throw error;
  }

  if (imageUrls !== null && imageUrls.length === 0) {
    const error = new Error('At least one image is required');
    error.statusCode = 400;
    throw error;
  }

  return { rentPrice, totalStock, availableStock };
};

const buildProductPayload = (cleanBody, imageUrls, numericValues, userId) => {
  return {
    name: cleanBody.name,
    category: cleanBody.category,
    rentPrice: numericValues.rentPrice,
    totalStock: numericValues.totalStock,
    availableStock: numericValues.availableStock,
    images: imageUrls,
    createdBy: userId
  };
};

export const createProduct = async (req, res) => {
  try {
    const imageUrls = req.files?.map(file => file.path) || [];

    if (!imageUrls.length) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required"
      });
    }

    const product = await Product.create({
      ...req.body,
      images: imageUrls,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    
    res.json({
      success: true,
      data: products
    });

  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error("Get Product By ID Error:", err);
    
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const cleanBody = sanitizeInput(req.body);
    const imageUrls = extractImageUrls(req.files);
    const updatePayload = {};

    if (cleanBody.name) updatePayload.name = cleanBody.name;
    if (cleanBody.category) updatePayload.category = cleanBody.category;

    if (cleanBody.rentPrice) {
      updatePayload.rentPrice = convertToNumber(cleanBody.rentPrice, 'rentPrice');
    }

    if (cleanBody.totalStock) {
      updatePayload.totalStock = convertToNumber(cleanBody.totalStock, 'totalStock');
    }

    if (cleanBody.availableStock) {
      updatePayload.availableStock = convertToNumber(cleanBody.availableStock, 'availableStock');
    }

    if (updatePayload.availableStock && updatePayload.totalStock) {
      if (updatePayload.availableStock > updatePayload.totalStock) {
        return res.status(400).json({
          success: false,
          message: 'availableStock cannot be greater than totalStock'
        });
      }
    }

    if (imageUrls.length > 0) updatePayload.images = imageUrls;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error("Update Product Error:", err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        errors: Object.keys(err.errors).map(
          key => `${key}: ${err.errors[key].message}`
        )
      });
    }

    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    console.error("Delete Product Error:", err);

    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }
};

