import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "./CatchAsyncErrors";
import { redis } from "../utils/redis";
require("dotenv").config();
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(
        new ErrorHandler("please login to access this resourcee", 400)
      );
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN!
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("tokenn iss nott validd", 400));
    }
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("user nott foundd", 400));
    }
    req.user = JSON.parse(user);

    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role!)) {
      return next(
        new ErrorHandler(
          `role ${req.user?.role} is not allowed to acccessss thissss `,
          403
        )
      );
    }
    next();
  };
};
