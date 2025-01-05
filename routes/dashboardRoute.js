const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/", dashboardController.showDasboard);
router.get("/getKPIS", dashboardController.getKPIS);
router.get("/getAgentProductivity", dashboardController.getAgentProductivity);
router.get("/getRevenueTrends", dashboardController.getRevenueTrends);
router.get("/getBillDistribution", dashboardController.getBillDistribution);
router.get("/getRevenueSources", dashboardController.getRevenueSources);


module.exports = router;