const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.get("/BusinessBillReport",ensureAuthenticated, reportController.showBusinessBillReportPage)
router.get("/PropertyBillReport",ensureAuthenticated, reportController.showPropertyBillReportPage)
router.get("/SignageBillReport",ensureAuthenticated, reportController.showSignageBillReportPage)
router.get("/CollectorBusinessBillReport",ensureAuthenticated, reportController.showCollectorBusinessBillReportPage)
router.get("/CollectorPropertyBillReport",ensureAuthenticated, reportController.showCollectorPropertyBillReportPage)
router.get("/CollectorSignageBillReport",ensureAuthenticated, reportController.showCollectorSignageBillReportPage)
router.get("/CollectorBusinessSummaryReport",ensureAuthenticated, reportController.showCollectorBusinessSummaryReportPage)
router.get("/CollectorPropertySummaryReport",ensureAuthenticated, reportController.showCollectorPropertySummaryReportPage)
router.get("/CollectorSignageSummaryReport",ensureAuthenticated, reportController.showCollectorSignageSummaryReportPage)

module.exports = router;