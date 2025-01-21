const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController ");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.post("/register",ensureAuthenticated, propertyController.registerProperty);
router.put("/update/:id",ensureAuthenticated, propertyController.updateProperty);
router.delete("/delete/:id",ensureAuthenticated, propertyController.deleteBusiness);
//router.get("/register", businessController.showRegistration);
//router.get("/getBusiness/:id", businessController.getBusiness)
router.get("/showProperties",ensureAuthenticated, propertyController.showProperties)
router.get("/api/properties",ensureAuthenticated, propertyController.apiProperty)
router.get("/feefixing/:id",ensureAuthenticated, propertyController.getFeeFixing);
router.get("/feefixingWithPropertyType/:id",ensureAuthenticated, propertyController.getFeeFixingWithPropertyType); 
router.get("/propertyFee/:client_id/:property_id",ensureAuthenticated, propertyController.getPropertyWithFeeFixing); //show Feefixing Page
router.put("/feefixing/:id",ensureAuthenticated, propertyController.feeFixing);
router.post("/updateTag",ensureAuthenticated, propertyController.updateTag);

module.exports = router;