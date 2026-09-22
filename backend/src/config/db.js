const mongoose = require("mongoose");
const env = require("./env");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: !env.IS_PROD,
    });
    isConnected = true;
    console.log(`[db] MongoDB connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("[db] MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
    isConnected = false;
  });

  return mongoose.connection;
}

module.exports = connectDB;
