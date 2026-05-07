import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: "A chat must have exactly 2 participants",
      },
    },
    // Links this chat to a specific pregnancy (null for legacy chats)
    pregnancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pregnancy",
      default: null,
    },
    // True when the pregnancy has ended — both sides can read but not send
    isReadOnly: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Unique chat per pregnancy per participant pair (sparse so legacy null-pregnancyId chats coexist)
chatSchema.index({ pregnancyId: 1, participants: 1 }, { sparse: true });

export const Chat = mongoose.model("Chat", chatSchema);
