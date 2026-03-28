const express = require("express");
const router = express.Router();
const controller = require("../controllers/campaignController");
const authMiddleware = require("../middleware/auth");

router.post("/subscribe", controller.subscribe);
router.get("/unsubscribe", controller.unsubscribe);

// Protected routes
router.post("/campaign", authMiddleware, controller.createCampaign);
router.post("/campaign/:id/send", authMiddleware, controller.sendCampaign);
router.get("/campaigns", authMiddleware, controller.getCampaigns);
router.get("/campaign/:id/stats", authMiddleware, controller.getCampaignStats);

module.exports = router;
