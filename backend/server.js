require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const cron = require("node-cron");
const port = 5000;
const { queueCampaign } = require("./controllers/campaignController.js");
const router = require("./routes/route.js");
const companyRoutes = require("./routes/companyRoutes.js");
const Campaign = require("./models/Campaign.js");

app.use(cors());
app.use(express.json());
app.use(router);
app.use("/company", companyRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    cron.schedule("*/5 * * * * *", async () => {
      console.log("⏰ Checking scheduled campaigns...");

      const campaigns = await Campaign.find({
        status: "scheduled",
        scheduledAt: { $lte: new Date() },
      });
console.log("campaigns", campaigns);
      for (const campaign of campaigns) {
        campaign.status = "processing";
        await campaign.save();
console.log("campaign", campaign);
        await queueCampaign(campaign);

        console.log("🚀 Scheduled campaign started:", campaign._id);
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
