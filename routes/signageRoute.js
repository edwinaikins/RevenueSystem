const express = require("express");
const router = express.Router();
const signageController = require("../controllers/signageController");
const ensureAuthenticated = require("../middleware/authMiddleware");

 router.post("/register",ensureAuthenticated, signageController.registerSignage);
 router.put("/update/:id",ensureAuthenticated, signageController.updateSignage);
 router.delete("/delete/:id",ensureAuthenticated, signageController.deleteSignage);

 router.get("/showSignages",ensureAuthenticated, signageController.showSignage)
router.get("/api/signages",ensureAuthenticated, signageController.apiSignage)
router.get("/feefixing/:id",ensureAuthenticated, signageController.getFeeFixing);
router.get("/feefixingWithSignageType/:id",ensureAuthenticated, signageController.getFeeFixingWithSignageType); 
router.get("/signageFee/:client_id/:signage_id",ensureAuthenticated, signageController.getSignageWithFeeFixing); //show Feefixing Page
router.put("/feefixing/:id",ensureAuthenticated, signageController.feeFixing);
router.post("/updateTag",ensureAuthenticated, signageController.updateTag);

module.exports = router;