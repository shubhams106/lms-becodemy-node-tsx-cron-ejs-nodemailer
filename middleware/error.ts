import { NextFunction, Response, Request } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleWare = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server errorr";

  //wrong  mongodb id error
  if (err.name === "CastError") {
    const message = `resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.statusCode === 11000) {
    const message = ` duplicate ${Object.keys(err.keyValue)} enteredddd`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt error

  if (err.name === "JsonWebTokenError") {
    const message = ` jwt token is invalid plzzzzzzzzzz trryy again`;
    err = new ErrorHandler(message, 400);
  }

  // jwt expired token

  if (err.name === "TokenExpiredError") {
    const message = ` jwt token is expired. plzzz trryyyyyyyyyy again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
