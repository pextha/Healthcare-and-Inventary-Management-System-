import { Message } from "../models/Message.js";

export class MessageRepository {
  // Save a new message
  async create(chatId, senderId, text) {
    const message = new Message({ chatId, senderId, text });
    return await message.save();
  }

  // Paginated list of messages for a chat (newest last), excludes deleted
  async findByChatId(chatId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId, isDeleted: false })
        .populate("senderId", "fullName email role")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId, isDeleted: false }),
    ]);

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Find a single message by ID
  async findById(messageId) {
    return await Message.findById(messageId)
      .populate("senderId", "fullName email role")
      .lean();
  }

  // Mark a single message as read
  async markAsRead(messageId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { returnDocument: "after" },
    ).lean();
  }

  // Mark all unread messages in a chat as read for a recipient
  async markAllAsRead(chatId, recipientId) {
    return await Message.updateMany(
      { chatId, senderId: { $ne: recipientId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  // soft delete a message by id
  async softDelete(messageId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true },
      { returnDocument: "after" },
    ).lean();
  }

  // get the latest non-deleted message in a chat (used to update lastMessage after delete)
  async findLatestInChat(chatId) {
    return await Message.findOne({ chatId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  }
}
