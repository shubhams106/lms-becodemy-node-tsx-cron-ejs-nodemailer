import mongoose from "mongoose";
require("dotenv").config();

const dbUrl = process.env.DB_URI || "";

export const connectDb = async () => {
  try {
    mongoose.connect(dbUrl).then((data) => {
      console.log(`mongodb is connected with ${data.connection.host}`);
    });
  } catch (error) {
    console.log(error, "while connecting to mongo");
    setTimeout(connectDb, 5000);
  }
};
