const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

emailLogSchema.index({ email: 1, campaignId: 1 }, { unique: true });

module.exports = mongoose.model("EmailLog", emailLogSchema);
