import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();
const authController = new AuthController();

// Registration endpoint
router.post("/register", authController.register);

// Login endpoint — sets HttpOnly cookie
router.post("/login", authController.login);

// Returns the current user from the cookie — used to re-hydrate client auth state
router.get("/me", authenticate, authController.me);

// Logout — clears the auth cookie
router.post("/logout", authController.logout);

// Forgot password – request reset token via email
router.post("/forgot-password", authController.forgotPassword);

// Reset password – verify token and set new password
router.post("/reset-password", authController.resetPassword);

export default router;
