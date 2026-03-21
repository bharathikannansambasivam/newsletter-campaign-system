const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",

      required: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
subscriberSchema.index({ email: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model("Subscriber", subscriberSchema);
