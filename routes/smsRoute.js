const express = require("express");
const router = express.Router();
const smsController = require("../controllers/smsController");


router.get("/send", smsController.sendBillSMS)


module.exports = router