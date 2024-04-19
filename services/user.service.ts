import { Response } from "express";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";

export const getUserById = async (id: string, res: Response) => {
  try {
    const userJson = await redis.get(id);
    if (userJson) {
      const user = JSON.parse(userJson!);
      res.status(201).json({
        success: true,
        user,
      });
    }
  } catch (error: any) {
    console.log(error, "error while fetchinggg user");
  }
};

export const getAllUsersService = async (res: Response) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    res.status(201).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error, "error while fetchinggg all user");
  }
};
