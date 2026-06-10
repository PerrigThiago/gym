import { Router } from "express";
import {
    loginController,
    registerController,
    resendVerificationController,
    verifyEmailController,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.get("/me", authMiddleware, (req, res) => {
    return res.json({
        usuario: (req as any).user,
    });
});

export default router;
