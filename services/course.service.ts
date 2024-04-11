import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import CourseModel from "../models/course.modal";
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Response, Request } from "express";

export const createCourse = CatchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.create(data);
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
