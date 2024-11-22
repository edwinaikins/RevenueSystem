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


module.exports = router;