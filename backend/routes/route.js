const express = require("express");
const router = express.Router();
const controller = require("../controllers/campaignController");

console.log(controller);
router.post("/subscribe", controller.subscribe);
router.post("/campaign", controller.createCampaign);
router.post("/campaign/:id/send", controller.sendCampaign);
router.get("/campaign/:id/stats", controller.getCampaignStats);
router.get("/campaigns", controller.getCampaigns);
router.get("/unsubscribe", controller.unsubscribe);
module.exports = router;
