import express from "express";
import { ChatController } from "../controllers/ChatController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";

const router = express.Router();
const chatController = new ChatController();

// All chat routes require authentication + one of the three clinical roles
// requireActiveDoctorMidwife ensures Doctors and Midwives have active accounts
router.use(
  authenticate,
  authorize("MOTHER", "DOCTOR", "MIDWIFE"),
  requireActiveDoctorMidwife,
);

// GET /api/chats/my - Get all chats for the authenticated user
router.get("/my", chatController.getMyChats);

// GET /api/chats/:id - Get a single chat by ID (participants only)
router.get("/:id", chatController.getChatById);

export default router;
