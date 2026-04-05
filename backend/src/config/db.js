import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️  MONGO_URI not set. Running in demo mode without database.");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed. Running in demo mode.");
    console.error("Error details:", err.message);
  }
};

export default connectDB;