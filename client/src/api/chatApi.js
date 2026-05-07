import axiosInstance from "./axiosInstance";

// ── Chats ────────────────────────────────────────────────────────────────────

/** Get all chats for the authenticated user */
export const getMyChats = () => axiosInstance.get("/chats/my");

/** Get a single chat by ID */
export const getChatById = (chatId) => axiosInstance.get(`/chats/${chatId}`);

// ── Messages ─────────────────────────────────────────────────────────────────

/** Get paginated messages for a chat (newest first from API, display reversed) */
export const getMessages = (chatId, page = 1, limit = 30) =>
  axiosInstance.get(`/messages/${chatId}`, { params: { page, limit } });

/** Send a message to a chat */
export const sendMessage = (chatId, text) =>
  axiosInstance.post("/messages", { chatId, text });

/** Mark a single message as read */
export const markMessageRead = (messageId) =>
  axiosInstance.put(`/messages/read/${messageId}`);

/** Soft-delete a message (sender only) */
export const deleteMessage = (messageId) =>
  axiosInstance.delete(`/messages/${messageId}`);
