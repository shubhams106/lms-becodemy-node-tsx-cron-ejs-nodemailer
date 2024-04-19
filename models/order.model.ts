import mongoose, { Document, Model, Schema } from "mongoose";
require("dotenv").config();

export interface IOrder extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
}

const orderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    courseId: {
      required: true,
      type: String,
    },
    userId: {
      required: true,
      type: String,
    },
    payment_info: {
      //   required: true,
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", orderSchema);
export default OrderModel;
