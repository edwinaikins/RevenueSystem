const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");

router.post("/createBill", billingController.createBill);
router.get("/", billingController.showBillingPage);
router.get("/getClientBillData", billingController.getClientBillData);
router.get("/saveBill", billingController.saveBill);
router.get("/getBusinessBill", billingController.getBusinessBill);
router.put("/updateArrears", billingController.populateArrears);
router.get("/getBillByStatus", billingController.getBillByStatus);

module.exports = router;