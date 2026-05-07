import { MessageRepository } from "../repositories/MessageRepository.js";
import { ChatRepository } from "../repositories/ChatRepository.js";

const messageRepository = new MessageRepository();
const chatRepository = new ChatRepository();

export class MessageService {
  // send a message, sender must be in the chat
  async sendMessage(chatId, senderId, text) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    const isParticipant = chat.participants.some(
      (p) => p._id === senderId,
    );

    if (!isParticipant) {
      const error = new Error(
        "Access denied. You are not a participant of this chat",
      );
      error.statusCode = 403;
      throw error;
    }

    // Block sending to read-only (ended pregnancy) chats
    if (chat.isReadOnly) {
      const error = new Error(
        "This conversation is read-only because the pregnancy has ended",
      );
      error.statusCode = 403;
      throw error;
    }

    const midwife = chat.participants.find((p) => p.role === "MIDWIFE");
    if (midwife && !midwife.isActive) {
      const error = new Error(
        "Cannot send message: the midwife's account is not active",
      );
      error.statusCode = 403;
      throw error;
    }

    const message = await messageRepository.create(chatId, senderId, text);

    // Update the chat's lastMessage snapshot
    await chatRepository.updateLastMessage(chatId, text);

    return message;
  }

  // get messages for a chat, requester must be a participant
  async getMessages(chatId, requesterId, page, limit) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    const isParticipant = chat.participants.some(
      (p) => p._id === requesterId,
    );

    if (!isParticipant) {
      const error = new Error(
        "Access denied. You are not a participant of this chat",
      );
      error.statusCode = 403;
      throw error;
    }

    return await messageRepository.findByChatId(chatId, page, limit);
  }

  // mark message as read, only the recipient can do this
  async markMessageRead(messageId, requesterId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      const error = new Error("Message not found");
      error.statusCode = 404;
      throw error;
    }

    if (message.senderId._id === requesterId) {
      const error = new Error("You cannot mark your own message as read");
      error.statusCode = 400;
      throw error;
    }

    if (message.isRead) {
      return message; // already read, skip the db write
    }

    return await messageRepository.markAsRead(messageId);
  }

  // soft delete a message, only the sender can do this
  async deleteMessage(messageId, requesterId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      const error = new Error("Message not found");
      error.statusCode = 404;
      throw error;
    }

    if (message.isDeleted) {
      const error = new Error("Message already deleted");
      error.statusCode = 400;
      throw error;
    }

    if (message.senderId._id !== requesterId) {
      const error = new Error("You can only delete your own messages");
      error.statusCode = 403;
      throw error;
    }

    const deleted = await messageRepository.softDelete(messageId);

    // if this was the lastMessage, roll back the chat snapshot to the previous message
    const chat = await chatRepository.findById(message.chatId);
    if (chat && chat.lastMessage === message.text) {
      const previous = await messageRepository.findLatestInChat(message.chatId);
      await chatRepository.updateLastMessage(
        message.chatId,
        previous ? previous.text : null,
        previous ? previous.createdAt : null,
      );
    }

    return deleted;
  }
}
