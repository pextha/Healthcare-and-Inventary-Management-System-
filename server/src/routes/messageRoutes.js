import express from "express";
import { MessageController } from "../controllers/MessageController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";
import {
  sendMessageValidator,
  getMessagesValidator,
  markReadValidator,
  deleteMessageValidator,
} from "../validators/chatValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();
const messageController = new MessageController();

// All message routes require authentication + one of the three clinical roles
router.use(authenticate, authorize("MOTHER", "DOCTOR", "MIDWIFE"), requireActiveDoctorMidwife);

// POST /api/messages - Send a message
router.post(
  "/",
  sendMessageValidator,
  validateRequest,
  messageController.sendMessage,
);

// GET /api/messages/:chatId - Get paginated messages for a chat
router.get(
  "/:chatId",
  getMessagesValidator,
  validateRequest,
  messageController.getMessages,
);

// PUT /api/messages/read/:id - Mark a message as read (recipient only)
router.put(
  "/read/:id",
  markReadValidator,
  validateRequest,
  messageController.markMessageRead,
);

// DELETE /api/messages/:id - Soft delete a message (sender only)
router.delete(
  "/:id",
  deleteMessageValidator,
  validateRequest,
  messageController.deleteMessage,
);

export default router;
