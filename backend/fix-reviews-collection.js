import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

async function fixCollection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.some(c => c.name === "reviews")) {
      console.log("🗑️  Dropping reviews collection...");
      await db.collection("reviews").drop();
      console.log("✅ Reviews collection dropped successfully");
    } else {
      console.log("ℹ️  No reviews collection found - will be created fresh");
    }
    
    await mongoose.disconnect();
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixCollection();
