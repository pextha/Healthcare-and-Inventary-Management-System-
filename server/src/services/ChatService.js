import { ChatRepository } from "../repositories/ChatRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const chatRepository = new ChatRepository();
const userRepository = new UserRepository();

export class ChatService {
  /**
   * Called internally by PregnancyService after doctor/midwife assignment.
   * Finds an existing pregnancy-chat between the two users or creates one.
   * Returns { chat, created }.
   */
  async createPregnancyChat(pregnancyId, userIdA, userIdB) {
    // Load both users
    const [userA, userB] = await Promise.all([
      userRepository.findById(userIdA),
      userRepository.findById(userIdB),
    ]);

    if (!userA || !userB) {
      const error = new Error("One or both users not found");
      error.statusCode = 404;
      throw error;
    }

    if (!userA.isActive || !userB.isActive) {
      const error = new Error("Both users must have active accounts");
      error.statusCode = 403;
      throw error;
    }

    // Return existing pregnancy-chat if one already exists (idempotent)
    const existing = await chatRepository.findByPregnancyAndUsers(
      pregnancyId,
      userIdA,
      userIdB,
    );
    if (existing) {
      return { chat: existing, created: false };
    }

    const chat = await chatRepository.createWithPregnancy(pregnancyId, [
      userIdA,
      userIdB,
    ]);
    // Re-fetch with populated participants
    const populated = await chatRepository.findById(chat._id);
    return { chat: populated, created: true };
  }

  /**
   * Marks all chats for a pregnancy as read-only.
   * Called when a pregnancy is cancelled or completed.
   */
  async deactivateChatsForPregnancy(pregnancyId) {
    return await chatRepository.setReadOnlyByPregnancy(pregnancyId);
  }

  /**
   * Marks read-only only the chat between two specific users within a pregnancy.
   * Called when a doctor or midwife is replaced — only the outgoing person's chat is frozen.
   */
  async deactivateChatBetween(pregnancyId, userIdA, userIdB) {
    return await chatRepository.setReadOnlyByPregnancyAndUsers(pregnancyId, userIdA, userIdB);
  }

  // Get all chats for the logged-in user
  async getMyChats(userId) {
    return await chatRepository.findByUserId(userId);
  }

  // Get chat by id — requester must be a participant
  async getChatById(chatId, requesterId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === requesterId,
    );

    if (!isParticipant) {
      const error = new Error("Access denied. You are not part of this chat");
      error.statusCode = 403;
      throw error;
    }

    return chat;
  }
}
