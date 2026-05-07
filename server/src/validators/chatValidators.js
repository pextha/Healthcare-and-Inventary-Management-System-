import { body, param, query } from "express-validator";

// POST /api/chats  — create or get chat
export const createOrGetChatValidator = [
  body("targetUserId")
    .notEmpty()
    .withMessage("targetUserId is required")
    .isMongoId()
    .withMessage("targetUserId must be a valid user ID"),
];

// GET /api/messages/:chatId  — paginated messages
export const getMessagesValidator = [
  param("chatId")
    .isMongoId()
    .withMessage("chatId must be a valid ID"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];

// POST /api/messages  — send message
export const sendMessageValidator = [
  body("chatId")
    .notEmpty()
    .withMessage("chatId is required")
    .isMongoId()
    .withMessage("chatId must be a valid ID"),
  body("text")
    .notEmpty()
    .withMessage("Message text is required")
    .isString()
    .withMessage("Message text must be a string")
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];

// PUT /api/messages/read/:id  — mark read
export const markReadValidator = [
  param("id")
    .isMongoId()
    .withMessage("Message ID must be a valid ID"),
];

// DELETE /api/messages/:id  — soft delete message
export const deleteMessageValidator = [
  param("id")
    .isMongoId()
    .withMessage("Message ID must be a valid ID"),
];
