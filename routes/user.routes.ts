import express, { Router } from "express";
import { activateUser, registerUser } from "../controllers/user.controller";

const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/activate-user", activateUser);
export default userRouter;
