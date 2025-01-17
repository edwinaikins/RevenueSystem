const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");

router.post("/createBill", billingController.createBill);
router.get("/", billingController.showBillingPage);
router.get("/getClientBillData", billingController.getClientBillData);
router.get("/saveBill", billingController.saveBill);
router.get("/getBusinessBill", billingController.getBusinessBill);
router.get("/getPropertyBill", billingController.getPropertyBill);
router.get("/getSignageBill", billingController.getSignageBill);
router.put("/updateArrears", billingController.populateArrears);
router.get("/getBillByStatus", billingController.getBillByStatus);
router.get("/getCollectorBusinessBills", billingController.getCollectorBusinessBills);
router.get("/getCollectorPropertyBills", billingController.getCollectorPropertyBills);
router.get("/getCollectorSignageBills", billingController.getCollectorSignageBills);

module.exports = router;