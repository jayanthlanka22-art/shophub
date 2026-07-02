import { Router } from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  mergeGuestCart,
} from "../controllers/cartController";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { addCartItemSchema, updateCartItemSchema, mergeGuestCartSchema } from "../validators/cartValidators";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/items", validateBody(addCartItemSchema), addCartItem);
router.put("/items/:productId", validateBody(updateCartItemSchema), updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.post("/merge", validateBody(mergeGuestCartSchema), mergeGuestCart);

export default router;
