const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.post("/register",ensureAuthenticated, businessController.registerBusiness);
router.put("/update/:id",ensureAuthenticated, businessController.updateBusiness);
router.delete("/delete/:id",ensureAuthenticated, businessController.deleteBusiness);
router.get("/register",ensureAuthenticated, businessController.showRegistration);
router.get("/showBusinesses",ensureAuthenticated, businessController.showBusinesses);
router.get("/api/businesses",ensureAuthenticated, businessController.apiBusiness);
router.put("/feefixing/:id",ensureAuthenticated, businessController.feeFixing);
router.get("/feefixing/:id",ensureAuthenticated, businessController.getFeeFixing);
router.get("/feefixingWithBusinessType/:id",ensureAuthenticated, businessController.getFeeFixingWithBusinessType); 
router.get("/businessFee/:client_id/:business_id",ensureAuthenticated, businessController.getBusinessWithFeeFixing); //show Feefixing Page
router.post("/updateTag",ensureAuthenticated, businessController.updateTag);
router.post("/resetTag",ensureAuthenticated, businessController.resetTag);


module.exports = router;