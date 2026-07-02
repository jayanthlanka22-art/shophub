import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators/authValidators";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/refresh", authRateLimiter, refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
