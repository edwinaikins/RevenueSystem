const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/BusinessBillReport", reportController.showBusinessBillReportPage)
router.get("/PropertyBillReport", reportController.showPropertyBillReportPage)
router.get("/SignageBillReport", reportController.showSignageBillReportPage)
router.get("/CollectorBusinessBillReport", reportController.showCollectorBusinessBillReportPage)
router.get("/CollectorPropertyBillReport", reportController.showCollectorPropertyBillReportPage)
router.get("/CollectorSignageBillReport", reportController.showCollectorSignageBillReportPage)
router.get("/CollectorBusinessSummaryReport", reportController.showCollectorBusinessSummaryReportPage)
router.get("/CollectorPropertySummaryReport", reportController.showCollectorPropertySummaryReportPage)
router.get("/CollectorSignageSummaryReport", reportController.showCollectorSignageSummaryReportPage)

module.exports = router;