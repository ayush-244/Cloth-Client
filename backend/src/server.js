import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import mongoose from "mongoose";

const startServer = async () => {
  // Connect to DB first
  connectDB();
  
  // Wait for connection and clean up collection
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // FORCE DROP: Remove reviews collection to fix orderId index issue
  try {
    const db = mongoose.connection.db;
    if (db) {
      console.log("🔧 Cleaning up reviews collection...");
      const collections = await db.listCollections().toArray();
      const hasReviews = collections.some(c => c.name === "reviews");
      
      if (hasReviews) {
        console.log("⚠️  Dropping old reviews collection with bad indexes...");
        await db.collection("reviews").drop();
        console.log("✅ Collection dropped - will be recreated on next insert");
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (err) {
    if (err.message.includes("ns not found")) {
      console.log("✅ No old collection found - fresh start");
    } else {
      console.error("Cleanup warning:", err.message);
    }
  }
  
  // NOW import and start the app
  const { default: app } = await import("./app.js");
  
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
