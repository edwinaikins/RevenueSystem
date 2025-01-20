const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.get("/",ensureAuthenticated, dashboardController.showDasboard);
router.get("/getKPIS",ensureAuthenticated, dashboardController.getKPIS);
router.get("/getAgentProductivity",ensureAuthenticated, dashboardController.getAgentProductivity);
router.get("/getRevenueTrends",ensureAuthenticated, dashboardController.getRevenueTrends);
router.get("/getBillDistribution",ensureAuthenticated, dashboardController.getBillDistribution);
router.get("/getRevenueSources",ensureAuthenticated, dashboardController.getRevenueSources);


module.exports = router;