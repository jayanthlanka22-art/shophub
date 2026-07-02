import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/productValidators";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", authenticate, authorize("admin"), validateBody(createProductSchema), createProduct);
router.put("/:id", authenticate, authorize("admin"), validateBody(updateProductSchema), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
