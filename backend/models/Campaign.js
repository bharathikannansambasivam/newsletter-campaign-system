const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "processing", "completed"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
