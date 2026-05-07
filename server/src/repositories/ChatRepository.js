import { Chat } from "../models/Chat.js";

export class ChatRepository {
  // Create a new chat (legacy — no pregnancy link)
  async create(participantIds) {
    const chat = new Chat({ participants: participantIds });
    return await chat.save();
  }

  // Find an existing active (non-frozen) pregnancy-linked chat between two users (order-independent).
  // Deliberately excludes read-only chats so that re-assigning a previously-removed
  // doctor/midwife creates a fresh chat rather than reactivating the frozen history.
  async findByPregnancyAndUsers(pregnancyId, userIdA, userIdB) {
    return await Chat.findOne({
      pregnancyId,
      participants: { $all: [userIdA, userIdB], $size: 2 },
      isReadOnly: false,
    })
      .populate("participants", "fullName email role isActive")
      .lean();
  }

  // Create a new chat linked to a pregnancy.
  // lastMessageAt is seeded to now so the chat appears at the top of the
  // conversation list immediately (sort is lastMessageAt: -1; nulls go last).
  async createWithPregnancy(pregnancyId, participantIds) {
    const chat = new Chat({
      pregnancyId,
      participants: participantIds,
      lastMessageAt: new Date(),
    });
    return await chat.save();
  }

  // Set isReadOnly = true on every chat belonging to a pregnancy
  async setReadOnlyByPregnancy(pregnancyId) {
    return await Chat.updateMany(
      { pregnancyId },
      { isReadOnly: true },
    );
  }

  // Set isReadOnly = true only on the chat between two specific users in a pregnancy
  // Used when a doctor/midwife is swapped — only the old person's chat is frozen
  async setReadOnlyByPregnancyAndUsers(pregnancyId, userIdA, userIdB) {
    return await Chat.updateMany(
      {
        pregnancyId,
        participants: { $all: [userIdA, userIdB], $size: 2 },
      },
      { isReadOnly: true },
    );
  }

  // Find all chats a user is part of
  async findByUserId(userId) {
    return await Chat.find({ participants: userId })
      .populate("participants", "fullName email role isActive")
      .sort({ lastMessageAt: -1 })
      .lean();
  }

  // Find a chat by its ID
  async findById(chatId) {
    return await Chat.findById(chatId)
      .populate("participants", "fullName email role isActive")
      .lean();
  }

  // Update lastMessage and lastMessageAt
  async updateLastMessage(chatId, text, date = new Date()) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: text, lastMessageAt: date },
      { returnDocument: "after" },
    ).lean();
  }
}
