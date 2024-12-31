const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController ");

router.post("/register", propertyController.registerProperty);
router.put("/update/:id", propertyController.updateProperty);
router.delete("/delete/:id", propertyController.deleteBusiness);
//router.get("/register", businessController.showRegistration);
//router.get("/getBusiness/:id", businessController.getBusiness)
router.get("/showProperties", propertyController.showProperties)
router.get("/api/properties", propertyController.apiProperty)
router.get("/feefixing/:id", propertyController.getFeeFixing);
router.get("/feefixingWithPropertyType/:id", propertyController.getFeeFixingWithPropertyType); 
router.get("/propertyFee/:client_id/:property_id", propertyController.getPropertyWithFeeFixing); //show Feefixing Page
router.put("/feefixing/:id", propertyController.feeFixing);

module.exports = router;