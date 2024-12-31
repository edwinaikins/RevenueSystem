const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/BusinessBillReport", reportController.showBusinessBillReportPage)

module.exports = router;