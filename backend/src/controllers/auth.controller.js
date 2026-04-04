import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    res.status(201).json({
      success: true,
      data: { token: generateToken(user) }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      const error = new Error("Wrong password");
      error.statusCode = 400;
      throw error;
    }

    res.json({
      success: true,
      data: { token: generateToken(user) }
    });
  } catch (err) {
    next(err);
  }
};
