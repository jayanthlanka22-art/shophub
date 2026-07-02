import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidators";

const router = Router();

router.get("/", listCategories);
router.post("/", authenticate, authorize("admin"), validateBody(createCategorySchema), createCategory);
router.put("/:id", authenticate, authorize("admin"), validateBody(updateCategorySchema), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

export default router;
