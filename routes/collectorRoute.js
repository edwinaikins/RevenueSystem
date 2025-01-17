const express = require("express");
const router = express.Router();
const collectorController = require("../controllers/collectorController");

router.get("/", collectorController.showPage)
router.post("/register", collectorController.addCollector);
router.put("/update/:id", collectorController.updateCollector);
router.delete("/delete/:id", collectorController.deleteCollector);
router.get("/getCollectors", collectorController.getCollectors);
router.get("/getCollector", collectorController.getCollector);
router.get("/billAssignment", collectorController.showPageBillAssignment);
router.post("/billAssign", collectorController.billAssign);
router.post("/billReassign", collectorController.reassignBill);
router.get("/collectorBills", collectorController.showPageCollectorBills);
router.get("/getCollectorBills/:collectorId", collectorController.getCollectorBills);
router.put("/updateDistributionStatus", collectorController.updateDistributionStatus);
router.get("/getCollectorBusinessSummary/:collectorId/:year", collectorController.getCollectorBusinessSummary);
router.get("/getCollectorPropertySummary/:collectorId/:year", collectorController.getCollectorPropertySummary);
router.get("/getCollectorSignageSummary/:collectorId/:year", collectorController.getCollectorSignageSummary);
//router.get("/searchCollector", collectorController.searchCollectors);
//router.get("/getall", collectorController.getAllCollectors);


module.exports = router;