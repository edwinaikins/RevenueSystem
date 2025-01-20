const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.get("/getClientPaymentData",ensureAuthenticated, paymentController.getClientPaymentData)
router.get("/showPaymentPage",ensureAuthenticated, paymentController.showPaymentPage)
router.post("/createPayment",ensureAuthenticated, paymentController.createPayment)
router.get("/getPayments",ensureAuthenticated, paymentController.getPayments)
router.get("/showPaymentApprovalPage",ensureAuthenticated, paymentController.showPaymentApprovalPage)
router.put("/rejectPayment/:id",ensureAuthenticated, paymentController.paymentReject)
router.put("/approvePayment/:id",ensureAuthenticated, paymentController.paymentApproved)

module.exports = router;