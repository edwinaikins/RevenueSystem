const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.get("/getClientPaymentData", paymentController.getClientPaymentData)
router.get("/showPaymentPage", paymentController.showPaymentPage)
router.post("/createPayment", paymentController.createPayment)
router.get("/getPayments", paymentController.getPayments)
router.get("/showPaymentApprovalPage", paymentController.showPaymentApprovalPage)
router.put("/rejectPayment/:id", paymentController.paymentReject)
router.put("/approvePayment/:id", paymentController.paymentApproved)

module.exports = router;