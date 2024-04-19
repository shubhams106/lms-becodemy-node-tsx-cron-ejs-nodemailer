import express, { Router } from "express";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controllers/order.controller";

const orderRouter = Router();
orderRouter.post(
  "/create-order",
  isAuthenticated,
  //   authorizeRoles("admin"),
  createOrder
);
orderRouter.get(
  "/getAllOrders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders
);

export default orderRouter;
