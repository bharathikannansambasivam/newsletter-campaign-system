const Subscriber = require("../models/subscriber");
const Campaign = require("../models/Campaign");
const EmailLog = require("../models/EmailLog");
const Company = require("../models/Company");
const { SendMessageBatchCommand } = require("@aws-sdk/client-sqs");
const sqs = require("../services/sqsClient");
exports.subscribe = async (req, res) => {
  try {
    const { email, company } = req.body;

    if (!email || !company) {
      return res.status(400).json({ message: "Email and company required" });
    }

    const foundCompany = await Company.findOne({
      companyName: company,
    });

    if (!foundCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const existingSubscriber = await Subscriber.findOne({
      email,
      companyId: foundCompany._id,
    });

    if (existingSubscriber) {
      existingSubscriber.isSubscribed = true;
      await existingSubscriber.save();

      return res.json({ message: "Re-subscribed successfully" });
    }

    await Subscriber.create({
      email,
      companyName: foundCompany.companyName,
      companyId: foundCompany._id,
    });

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { subject, content, scheduledAt } = req.body;
    const companyId = req.user.companyId;

    const campaign = await Campaign.create({
      subject,
      content,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? "scheduled" : "draft",
      companyId,
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const campaignId = req.params.id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const total = await EmailLog.countDocuments({ campaignId });
    const sent = await EmailLog.countDocuments({
      campaignId,
      status: "sent",
    });
    const failed = await EmailLog.countDocuments({
      campaignId,
      status: "failed",
    });
    const pending = await EmailLog.countDocuments({
      campaignId,
      status: "pending",
    });

    const successPercentage =
      total === 0 ? 0 : ((sent / total) * 100).toFixed(2);

    res.json({
      campaignId,
      total,
      sent,
      failed,
      pending,
      successPercentage: `${successPercentage}%`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function queueCampaign(campaign) {
  const subscribers = await Subscriber.find({
    companyId: campaign.companyId,
    isSubscribed: true,
  });

  const logs = subscribers.map((sub) => ({
    email: sub.email,
    campaignId: campaign._id,
    status: "pending",
  }));

  await EmailLog.insertMany(logs);

  const BATCH_SIZE = 10;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const entries = batch.map((sub) => ({
      Id: sub._id.toString(),
      MessageBody: JSON.stringify({
        email: sub.email,
        campaignId: campaign._id,
      }),
    }));
    console.log("entries", entries);
    await sqs.send(
      new SendMessageBatchCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        Entries: entries,
      })
    );
  }
}

exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== "draft") {
      return res.status(400).json({
        message: "Campaign already processed",
      });
    }

    campaign.status = "processing";
    await campaign.save();

    await queueCampaign(campaign);

    res.json({ message: "Campaign queued successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.queueCampaign = queueCampaign;

exports.unsubscribe = async (req, res) => {
  try {
    const { email, companyId } = req.query;

    if (!email || !companyId) {
      return res
        .status(400)
        .json({ message: "email and companyId are required" });
    }

    const subscriber = await Subscriber.findOne({ email, companyId });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    subscriber.isSubscribed = false;
    await subscriber.save();

    res.redirect("https://newslettercam.me/unsubscribed");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const campaigns = await Campaign.find({ companyId });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
