const express = require("express");
const router = express.Router();
const signageController = require("../controllers/signageController");

 router.post("/register", signageController.registerSignage);
 router.put("/update/:id", signageController.updateSignage);
 router.delete("/delete/:id", signageController.deleteSignage);

 router.get("/showSignages", signageController.showSignage)
router.get("/api/signages", signageController.apiSignage)
router.get("/feefixing/:id", signageController.getFeeFixing);
router.get("/feefixingWithSignageType/:id", signageController.getFeeFixingWithSignageType); 
router.get("/signageFee/:client_id/:signage_id", signageController.getSignageWithFeeFixing); //show Feefixing Page
router.put("/feefixing/:id", signageController.feeFixing);

module.exports = router;