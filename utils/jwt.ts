import { IUser } from "../models/user.model";
import { redis } from "./redis";
import { NextFunction, Response, Request } from "express";
require("dotenv").config();
interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean; // this will only be set to true in production
}
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();
  const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE!);
  const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE!);
  redis.set(user._id, JSON.stringify(user) as any);
  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 60 * 1000),
    maxAge: refreshTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  if (process.env.Node_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
