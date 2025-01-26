const express = require("express");
const router = express.Router();
const collectorController = require("../controllers/collectorController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.get("/",ensureAuthenticated, collectorController.showPage)
router.post("/register",ensureAuthenticated, collectorController.addCollector);
router.put("/update/:id",ensureAuthenticated, collectorController.updateCollector);
router.delete("/delete/:id",ensureAuthenticated, collectorController.deleteCollector);
router.get("/getCollectors",ensureAuthenticated, collectorController.getCollectors);
router.get("/getCollector",ensureAuthenticated, collectorController.getCollector);
router.get("/billAssignment",ensureAuthenticated, collectorController.showPageBillAssignment);
router.post("/billAssign",ensureAuthenticated, collectorController.billAssign);
router.post("/billReassign",ensureAuthenticated, collectorController.reassignBill);
router.get("/collectorBills",ensureAuthenticated, collectorController.showPageCollectorBills);
router.get("/getCollectorBills/:collectorId",ensureAuthenticated, collectorController.getCollectorBills);
router.put("/updateDistributionStatus",ensureAuthenticated, collectorController.updateDistributionStatus);
router.get("/getCollectorBusinessSummary/:collectorId/:year/:tagged/:filterOption",ensureAuthenticated, collectorController.getCollectorBusinessSummary);
router.get("/getCollectorPropertySummary/:collectorId/:year/:tagged",ensureAuthenticated, collectorController.getCollectorPropertySummary);
router.get("/getCollectorSignageSummary/:collectorId/:year/:tagged",ensureAuthenticated, collectorController.getCollectorSignageSummary);
//router.get("/searchCollector", collectorController.searchCollectors);
//router.get("/getall", collectorController.getAllCollectors);


module.exports = router;