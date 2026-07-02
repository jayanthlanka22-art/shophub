import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { placeOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(placeOrderSchema), placeOrder);
router.get("/my", getMyOrders);
router.get("/my/:id", getMyOrderById);

router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), validateBody(updateOrderStatusSchema), updateOrderStatus);

export default router;
