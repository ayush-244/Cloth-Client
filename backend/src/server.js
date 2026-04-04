import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";

const startServer = async () => {
  const { default: app } = await import("./app.js");
  
  connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();