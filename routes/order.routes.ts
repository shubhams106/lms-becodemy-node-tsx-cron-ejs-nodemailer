import express, { Router } from "express";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controllers/order.controller";

const orderRouter = Router();
orderRouter.post(
  "/create-order",
  isAuthenticated,
  //   authorizeRoles("admin"),
  createOrder
);

export default orderRouter;
