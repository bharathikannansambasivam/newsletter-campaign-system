require("dotenv").config();

const { SendEmailCommand } = require("@aws-sdk/client-ses");

const mongoose = require("mongoose");
const EmailLog = require("./models/EmailLog");
const Campaign = require("./models/Campaign");

const {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

const sqs = require("./services/sqsClient");
const ses = require("./services/sesClient");

//Delay
const RATE_LIMIT = 1000; // ms

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
}

/* ===============================
   PROCESS SINGLE MESSAGE
================================ */
async function processMessage(message) {
  const body = JSON.parse(message.Body);
  try {
    const log = await EmailLog.findOne({
      email: body.email,
      campaignId: body.campaignId,
    });

    if (!log || log.status === "sent") {
      // Already processed → delete safely
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
        })
      );
      return;
    }

    //  🔥 10% failure simulation
    // const shouldFail = Math.random() < 0.1;
    // if (shouldFail) {
    //   console.log("❌ Failed:", body.email);
    //   throw new Error("Simulated failure");
    // }
    const campaign = await Campaign.findById(body.campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }
    await ses.send(
      new SendEmailCommand({
        Source: "bharathikannansambasivam@gmail.com",
        Destination: {
          ToAddresses: [body.email],
        },
        Message: {
          Subject: {
            Data: campaign.subject,
          },
          Body: {
            Html: {
              Data: `
              <p>${campaign.content}</p>
              <a href="${
                process.env.BASE_URL
              }/unsubscribe?email=${encodeURIComponent(body.email)}&companyId=${
                campaign.companyId
              }"
         style="
           display:inline-block;
           padding:10px 20px;
           background-color:#ff4d4f;
           color:white;
           text-decoration:none;
           border-radius:5px;
           font-weight:bold;
         ">
        Unsubscribe
      </a>
              <br/>
              `,
            },
          },
        },
      })
    );
    // Mark as sent
    await EmailLog.findOneAndUpdate(
      { email: body.email, campaignId: body.campaignId },
      { status: "sent" }
    );
    await delay(RATE_LIMIT);

    // Delete from SQS
    await sqs.send(
      new DeleteMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );

    console.log("✅ Sent:", body.email);

    // Optional: mark campaign completed
    const remaining = await EmailLog.countDocuments({
      campaignId: body.campaignId,
      status: "pending",
    });

    if (remaining === 0) {
      await Campaign.findByIdAndUpdate(body.campaignId, {
        status: "completed",
      });
      console.log("🎉 Campaign completed!");
    }
  } catch (err) {
    console.log("⚠ Message will retry:", body.email);
  }
}

/* ===============================
   POLL QUEUE
================================ */
async function pollQueue() {
  console.log("🚀 Worker started...");

  while (true) {
    try {
      const response = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 10,
        })
      );

      if (!response.Messages) continue;
      for (const msg of response.Messages) {
        await processMessage(msg);
      }
      // await Promise.all(response.Messages.map((msg) => processMessage(msg)));
    } catch (error) {
      console.error("Worker error:", error.message);
    }
  }
}

/* ===============================
   START WORKER 
================================ */
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Worker connected to MongoDB");
  pollQueue();
});
