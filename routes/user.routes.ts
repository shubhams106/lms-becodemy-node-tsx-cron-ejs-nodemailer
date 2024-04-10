import express, { Router } from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logout,
  registerUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateUser,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-info", isAuthenticated, updateUser);
userRouter.put("/update-password", isAuthenticated, updatePassword);

export default userRouter;
