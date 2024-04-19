import mongoose, { Document, Model, Schema } from "mongoose";
require("dotenv").config();

export interface INotification extends Document {
  title: string;
  userId: string;
  message: string;
  status: string;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    userId: {
      // required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
    message: {
      required: true,
      type: String,
    },
    status: {
      required: true,
      type: String,
      default: "unread",
    },
  },
  { timestamps: true }
);

const NotificationModel: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
export default NotificationModel;
