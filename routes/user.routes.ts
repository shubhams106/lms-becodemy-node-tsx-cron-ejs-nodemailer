import express, { Router } from "express";
import {
  activateUser,
  loginUser,
  logout,
  registerUser,
} from "../controllers/user.controller";

const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logout);
export default userRouter;
