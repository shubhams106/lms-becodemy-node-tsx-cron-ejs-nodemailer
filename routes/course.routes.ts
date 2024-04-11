import express, { Router } from "express";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  addAnswer,
  addQuestion,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";

const courseRouter = Router();
courseRouter.post(
  "/upload-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);
courseRouter.get("/course/:id", getSingleCourse);
courseRouter.get("/courses", getAllCourses);
courseRouter.get(
  "/user-owned-course/:id",
  isAuthenticated,
  // authorizeRoles("admin"),
  getCourseByUser
);
courseRouter.put(
  "/add-question",
  isAuthenticated,
  // authorizeRoles("admin"),
  addQuestion
);
courseRouter.post(
  "/answer",
  isAuthenticated,
  // authorizeRoles("admin"),
  addAnswer
);
export default courseRouter;
