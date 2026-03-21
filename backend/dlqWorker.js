require("dotenv").config();
const mongoose = require("mongoose");
const EmailLog = require("./models/EmailLog");

const {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

const sqs = require("./services/sqsClient");

const DLQ_URL = process.env.SQS_DLQ_URL;

/* ===============================
   PROCESS DLQ MESSAGE
================================ */
async function processDLQMessage(message) {
  const body = JSON.parse(message.Body);

  try {
    console.log("📥 DLQ message:", body.email);

    // Mark email as failed
    await EmailLog.findOneAndUpdate(
      {
        email: body.email,
        campaignId: body.campaignId,
      },
      { status: "failed" }
    );

    

    // Delete from DLQ after processing
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: DLQ_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );

    console.log("❌ Marked as failed:", body.email);
  } catch (error) {
    console.error("DLQ processing error:", error.message);
  }
}

/* ===============================
   POLL DLQ
================================ */
async function pollDLQ() {
  console.log("🚨 DLQ Worker started...");

  while (true) {
    try {
      const response = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: DLQ_URL,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 10,
        })
      );

      if (!response.Messages) continue;

      for (const msg of response.Messages) {
        await processDLQMessage(msg);
      }
    } catch (error) {
      console.error("DLQ Worker error:", error.message);
    }
  }
}

/* ===============================
   START DLQ WORKER
================================ */
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("DLQ Worker connected to MongoDB");
  pollDLQ();
});
