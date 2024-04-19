import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/user.model";
import sendMail from "../utils/sendMail";

import CourseModel from "../models/course.modal";
import NotificationModel from "../models/notification.model";
import OrderModel from "../models/order.model";
require("dotenv").config();

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body;
      const userId = req.user?._id;
      const user = await userModel.findById(req.user!._id);
      if (!courseId) {
        return next(
          new ErrorHandler("pleaseeeee provide wt needs d most", 400)
        );
      }
      const isCourseExists = user?.courses.some(
        (item: any) => item._id.toString() === courseId
      );
      if (isCourseExists) {
        return next(new ErrorHandler("u already hav that? y buy again ", 400));
      }
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course doesnot existssss", 400));
      }
      const data = {
        courseId: course._id,
        userId,
        payment_info,
      };
      await OrderModel.create(data);

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
      try {
        await sendMail({
          email: user!.email,
          subject: "Received an order",
          template: "orderConfirmation-mail.ejs",
          data: mailData,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
      user?.courses.push(courseId);
      course.purchased! += 1;
      await course?.save();
      await user?.save();
      await NotificationModel.create({
        userId,
        title: "New Order",
        message: `You have a new order of ${course!.name} from ${user!.name}`,
      });
      res.status(201).json({
        success: true,
        order: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// export const uploadCourse = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
