import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "user@example.com" });
    if (existingUser) {
      console.log("✅ Test user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create test user
    const testUser = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: hashedPassword,
      role: "user"
    });

    console.log("✅ Test user created successfully:");
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Role: ${testUser.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding user:", error.message);
    process.exit(1);
  }
};

seedUser();
