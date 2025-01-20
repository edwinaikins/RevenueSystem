const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.post("/createBill", ensureAuthenticated, billingController.createBill);
router.get("/", ensureAuthenticated, billingController.showBillingPage);
router.get("/getClientBillData", ensureAuthenticated, billingController.getClientBillData);
router.get("/saveBill", ensureAuthenticated, billingController.saveBill);
router.get("/getBusinessBill",ensureAuthenticated, billingController.getBusinessBill);
router.get("/getPropertyBill",ensureAuthenticated, billingController.getPropertyBill);
router.get("/getSignageBill",ensureAuthenticated, billingController.getSignageBill);
router.put("/updateArrears",ensureAuthenticated, billingController.populateArrears);
router.get("/getBillByStatus",ensureAuthenticated, billingController.getBillByStatus);
router.get("/getCollectorBusinessBills",ensureAuthenticated, billingController.getCollectorBusinessBills);
router.get("/getCollectorPropertyBills",ensureAuthenticated, billingController.getCollectorPropertyBills);
router.get("/getCollectorSignageBills",ensureAuthenticated, billingController.getCollectorSignageBills);

module.exports = router;