import Redis from "ioredis";
require("dotenv").config();
const redisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  } else {
    throw new Error("redis URL is not here");
  }
};

export const redis = new Redis(redisUrl());
