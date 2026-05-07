import { MessageService } from "../services/MessageService.js";

export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  // POST /api/messages
  sendMessage = async (req, res, next) => {
    try {
      const senderId = req.user.userId;
      const { chatId, text } = req.body;

      const message = await this.messageService.sendMessage(chatId, senderId, text);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/messages/:chatId?page=1&limit=20
  getMessages = async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const requesterId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getMessages(
        chatId,
        requesterId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/messages/read/:id
  markMessageRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requesterId = req.user.userId;

      const message = await this.messageService.markMessageRead(id, requesterId);

      return res.status(200).json({
        success: true,
        message: "Message marked as read",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/messages/:id
  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const requesterId = req.user.userId;

      const message = await this.messageService.deleteMessage(id, requesterId);

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };
}
