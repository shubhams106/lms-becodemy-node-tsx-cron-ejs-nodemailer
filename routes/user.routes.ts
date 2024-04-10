import express, { Router } from "express";
import {
  activateUser,
  loginUser,
  logout,
  registerUser,
  updateAccessToken,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/refresh", updateAccessToken);
export default userRouter;
