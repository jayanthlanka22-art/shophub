import { Router } from "express";
import { listUsers, getDashboardStats } from "../controllers/adminController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/users", listUsers);
router.get("/dashboard", getDashboardStats);

export default router;
