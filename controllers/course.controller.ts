import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel, { IUser } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import cloudinary from "cloudinary";
import { getUserById } from "../services/user.service";
import { url } from "inspector";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.modal";
import mongoose from "mongoose";
import NotificationModel from "../models/notification.model";
require("dotenv").config();

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// for everyone without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(courseId).select(
          "-courseData.links -courseData.videoUrl -courseData.suggestion -courseData.questions"
        );

        await redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const courses = await JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.links -courseData.videoUrl -courseData.suggestion -courseData.questions"
        );
        await redis.set("allCourses", JSON.stringify(courses));
        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
//user purchased courses
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourses = req.user?.courses;
      const courseId = req.params.id;
      const isCourseExists = userCourses?.find(
        (item: any) => item._id.toString() === courseId
      );

      if (!isCourseExists) {
        return next(
          new ErrorHandler("pleasse pay first to view this content", 400)
        );
      }
      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });

      // const isCourseExists = userCourses?.includes((item) => courseId);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId } = req.body;
      const user = req.user;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid content id", 400));
      }
      const courseContent = course?.courseData?.find(
        (item: any) => item._id.toString() === contentId
      );
      if (!courseContent) {
        return next(new ErrorHandler("invalid course content id", 400));
      }
      const newQuestion: any = {
        user,
        question,
        questionReplies: [],
      };
      courseContent.questions.push(newQuestion);
      await course?.save();
      await NotificationModel.create({
        title: "new question asked",
        message: `${user!.name} asked a new question on ${course!.name}, ${
          courseContent?.title
        }`,
        user: req.user?._id,
      });
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, contentId, questionId, answer } = req.body;
      const user = req.user;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid content id", 400));
      }
      const courseContent = course?.courseData?.find(
        (item: any) => item._id.toString() === contentId
      );
      if (!courseContent) {
        return next(new ErrorHandler("invalid course content id", 400));
      }

      const questionToFind = courseContent?.questions?.find(
        (item: any) => item._id.toString() === questionId
      );
      if (!questionToFind) {
        return next(new ErrorHandler("question not found", 400));
      }

      const newAnswer: any = {
        user,
        answer,
      };
      questionToFind.questionReplies!.push(newAnswer);
      await course?.save();
      if (user?._id === questionToFind.user._id) {
        res.status(201).json({
          success: true,
          course,
        });
        // send notification
        await NotificationModel.create({
          title: "new answer received",
          message: `${user!.name} answered on  ${courseContent?.title}`,
          user: req.user?._id,
        });
      } else {
        const data = {
          answer,
          name: questionToFind.user.name,
          question: questionToFind.question,
          title: courseContent.title,
        };
        // send mail
        try {
          await sendMail({
            email: questionToFind.user.email,
            subject: "You have got a new reply on your question",
            template: "answer-mail.ejs",
            data,
          });
          res.status(201).json({
            success: true,
            message: `email to ${questionToFind.user.email} have been sent regarding someone answering to your ques`,
            course,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 400));
        }
      }
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
interface IAddReviewData {
  rating: number;
  comment: string;
}

export const reviewCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rating, comment } = req.body as IAddReviewData;
      if (!rating || !comment) {
        return next(
          new ErrorHandler("please provide both comment and rating", 400)
        );
      }
      const user = req.user;
      const courseId = req.params.id;
      const userCourseList = user?.courses;
      const isCourseExist = userCourseList?.some(
        (item: any) => item._id.toString() === courseId
      );
      if (!isCourseExist) {
        return next(
          new ErrorHandler(
            "you can only rate products which you have bought",
            400
          )
        );
      }
      const course = await CourseModel.findById(courseId);
      const reviewData: any = {
        user,
        rating,
        comment,
      };
      course?.reviews.push(reviewData);
      let avg = 0;
      course?.reviews.length! > 0 &&
        course?.reviews.forEach((item) => (avg += item.rating));
      if (course) {
        course.ratings = avg / course?.reviews.length;
      }
      await course?.save();
      const notification = {
        title: "New Review Received",
        message: `${user!.name} has given a review in ${course?.name}`,
      };
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, reviewId, comment } = req.body;
      if (!courseId || !reviewId || !comment) {
        return next(
          new ErrorHandler("course, comment and review all required", 400)
        );
      }
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course not found", 400));
      }
      const review = course.reviews.find(
        (item: any) => item._id.toString() === reviewId
      );
      if (!review) {
        return next(new ErrorHandler("reviewww not found", 400));
      }
      const replyData: any = {
        user: req.user,
        comment,
      };
      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies?.push(replyData);
      await course.save();
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllCoursess = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find().sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      if (!id) {
        return next(new ErrorHandler("course id  not found", 400));
      }
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("galat id bhaii", 400));
      }
      await CourseModel.findByIdAndDelete(id);
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "courseee deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
