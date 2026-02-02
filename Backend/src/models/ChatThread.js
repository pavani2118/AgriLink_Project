const mongoose = require("mongoose");

const chatThreadSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    lastMessageText: { type: String, default: "" },
    lastMessageSenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastMessageAt: { type: Date, default: null },

    lastSeen: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ChatThread || mongoose.model("ChatThread", chatThreadSchema);
